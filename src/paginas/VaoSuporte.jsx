import React, { useState, useEffect } from "react";
import {
  Settings,
  Droplets,
  Activity,
  Box,
  Layers,
  Calculator,
  ArrowRight,
} from "lucide-react";
import PIPE_DATA from "../dados/pipe_data.json";
import MATERIALS from "../dados/material_data.json";
import FLUIDS from "../dados/fluids_data.json";
import INSULATION from "../dados/insulation_data.json";
import { InputGroup, Card, Select } from "../componentes/Componentes.jsx";

export default function PipeSpanCalculator() {
  // 1. Dados do Tubo
  const [pipeNorm, setPipeNorm] = useState("sch-40");
  const [nominalDia, setNominalDia] = useState("2");
  const [od, setOd] = useState(60.3);
  const [thk, setThk] = useState(3.91);
  const [pipeMass, setPipeMass] = useState(5.44);
  const [inertia, setInertia] = useState(36.1);

  // 2. Material
  const [materialType, setMaterialType] = useState("aco-carbono");
  const [elasticModulus, setElasticModulus] = useState(200);

  // 3. Isolamento
  const [insulationType, setInsulationType] = useState("Customizado");
  const [insulationMass, setInsulationMass] = useState(0);
  const [insulationThickness, setInsulationThickness] = useState(0);

  // 3. Fluido
  const [fluidType, setFluidType] = useState("agua");
  const [fluidDensity, setFluidDensity] = useState(1000);

  // 4. Cargas
  const [loadPipe, setLoadPipe] = useState(0);
  const [loadInsulation, setLoadInsulation] = useState(0);
  const [loadFluid, setLoadFluid] = useState(0);
  const [loadPoint, setLoadPoint] = useState(0);

  // 5. Flecha
  const [maxDeflection, setMaxDeflection] = useState(15); // mm

  // 6. Resultado
  const [maxSpan, setMaxSpan] = useState(null);

  // --- Efeitos para Preenchimento Automático ---

  // Atualiza propriedades do tubo quando a norma ou diâmetro muda
  useEffect(() => {
    const tubosDaNorma = PIPE_DATA[pipeNorm];
    if (pipeNorm !== "custom" && tubosDaNorma) {
      const diametro = tubosDaNorma[nominalDia]
        ? nominalDia
        : Object.keys(tubosDaNorma)[0];
      const data = tubosDaNorma[diametro];
      if (diametro !== nominalDia) {
        setNominalDia(diametro);
      }
      setOd(data.od);
      setThk(data.thk);
      setPipeMass(data.mass);
      setInertia(data.inertia);
    }
  }, [pipeNorm, nominalDia]);

  // Atualiza propriedades do material
  useEffect(() => {
    if (materialType !== "custom" && MATERIALS[materialType]) {
      setElasticModulus(MATERIALS[materialType].elasticModulus);
    }
  }, [materialType]);

  // Atualiza propriedades do isolamento
  useEffect(() => {
    if (insulationType !== "Customizado" && insulationThickness !== 0) {
      setInsulationMass(
        INSULATION[insulationType][nominalDia][insulationThickness].mass,
      );
    }
  }, [insulationType, insulationThickness, nominalDia]);

  // Atualiza propriedades do fluido
  useEffect(() => {
    if (fluidType !== "custom" && FLUIDS[fluidType]) {
      setFluidDensity(FLUIDS[fluidType].density);
    }
  }, [fluidType]);

  // Calcula cargas distribuídas automaticamente (N/m)
  useEffect(() => {
    const g = 9.81; // Aceleração da gravidade (m/s²)
    setLoadPipe(Number((pipeMass * g).toFixed(2)));
    setLoadInsulation(Number((insulationMass * g).toFixed(2)));

    // Calcula massa do fluido por metro linear: Área interna * 1m * Densidade
    const idMm = od - 2 * thk; // Diâmetro interno em mm
    if (idMm > 0) {
      const idM = idMm / 1000; // Converte para metros
      const internalArea = (Math.PI * Math.pow(idM, 2)) / 4; // m2
      const volumePerMeter = internalArea * 1; // m3/m
      const fluidMassPerMeter = volumePerMeter * fluidDensity; // kg/m
      setLoadFluid(Number((fluidMassPerMeter * g).toFixed(2)));
    } else {
      setLoadFluid(0);
    }
  }, [od, thk, pipeMass, fluidDensity, insulationMass]);

  // --- Lógica de Cálculo ---
  const calculateSpan = () => {
    const E_Pa = parseFloat(elasticModulus) * 1e9; // GPa para Pa (N/m²)
    const I_m4 = parseFloat(inertia) * 1e-8; // cm⁴ para m⁴
    const def_m = parseFloat(maxDeflection) * 1e-3; // mm para m

    const q = parseFloat(loadPipe) + parseFloat(loadFluid); // Carga distribuída total (N/m)
    const P = parseFloat(loadPoint); // Carga pontual (N)

    if (E_Pa === 0 || I_m4 === 0) {
      setMaxSpan(null);
      return;
    }

    // Função de deflexão f(L) = Deflexão_calculada - Deflexão_maxima
    // Fórmula: (5 * q * L^4) / (384 * E * I) + (P * L^3) / (48 * E * I) - Delta = 0
    const f = (L) => {
      const def_distribuida = (5 * q * Math.pow(L, 4)) / (384 * E_Pa * I_m4);
      const def_pontual = (P * Math.pow(L, 3)) / (48 * E_Pa * I_m4);
      return def_distribuida + def_pontual - def_m;
    };

    // Implementação do Método da Bisseção
    let left = 0.001; // L_min (m)
    let right = 100.0; // L_max (m)
    const tol = 1e-6; // Tolerância de erro (m)
    let mid = left;

    // Se as cargas ou limites gerarem um cenário inválido
    if (f(left) * f(right) > 0) {
      console.error(
        "Raiz fora do intervalo de bisseção [0.001, 100]. Ajuste os parâmetros.",
      );
      setMaxSpan(null);
      return;
    }

    let iteracoes = 0;
    while ((right - left) / 2.0 > tol && iteracoes < 1000) {
      mid = (left + right) / 2.0;
      const f_mid = f(mid);

      if (f_mid === 0.0) break; // Raiz exata encontrada

      if (f(left) * f_mid < 0) {
        right = mid;
      } else {
        left = mid;
      }
      iteracoes++;
    }

    setMaxSpan(mid);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calculator className="text-blue-600 w-8 h-8" />
            Cálculo de Vão entre Suportes
          </h1>
          <p className="text-slate-600 mt-2">
            Determine o distanciamento máximo permitido entre suportes de
            tubulação baseado na deflexão máxima admissível.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DADOS DO TUBO */}
          <Card titulo="1. Dados do Tubo">
            <Select
              label="Norma/Padrão"
              value={pipeNorm}
              onChange={setPipeNorm}
              options={Object.keys(PIPE_DATA || {})
                .concat("Customizado")
                .map((std) => {
                  if (std === "Customizado") {
                    return { value: "Custom", label: "Customizado" };
                  } else {
                    return { value: std, label: std.toUpperCase() };
                  }
                })}
            />

            {pipeNorm !== "Custom" && (
              <Select
                label="Diâmetro Nominal"
                value={nominalDia}
                onChange={setNominalDia}
                options={Object.keys(PIPE_DATA[pipeNorm] || {})
                  .sort((a, b) => {
                    const odA = PIPE_DATA[pipeNorm][a].od;
                    const odB = PIPE_DATA[pipeNorm][b].od;
                    return odA - odB;
                  })
                  .map((dn) => ({
                    value: dn,
                    label: `${dn}"`,
                  }))}
              />
            )}

            <InputGroup
              label="Diâmetro Externo (OD)"
              value={od}
              onChange={setOd}
              unit="mm"
              disabled={pipeNorm !== "custom"}
            />
            <InputGroup
              label="Espessura de Parede"
              value={thk}
              onChange={setThk}
              unit="mm"
              disabled={pipeNorm !== "custom"}
            />
            <InputGroup
              label="Massa Linear"
              value={pipeMass}
              onChange={setPipeMass}
              unit="kg/m"
              disabled={pipeNorm !== "custom"}
            />
            <InputGroup
              label="Momento de Inércia (I)"
              value={inertia}
              onChange={setInertia}
              unit="cm⁴"
              disabled={pipeNorm !== "custom"}
            />
          </Card>

          {/* DADOS DO MATERIAL*/}
          <Card titulo="2. Material">
            <Select
              label="Tipo de Material"
              value={materialType}
              onChange={setMaterialType}
              options={Object.keys(MATERIALS || {}).map((material) => ({
                value: material,
                label: material.toLocaleUpperCase(),
              }))}
            />

            <InputGroup
              label="Módulo de Elasticidade (E)"
              value={elasticModulus}
              onChange={setElasticModulus}
              unit="GPa"
              disabled={materialType !== "custom"}
            />
          </Card>

          {/* DADOS DO ISOLAMENTO*/}
          <Card titulo="3. Isolamento">
            <Select
              label="Tipo de Isolamento"
              value={insulationType}
              onChange={setInsulationType}
              options={Object.keys(INSULATION || {})
                .concat("Customizado")
                .map((insulation) => ({
                  value: insulation,
                  label: insulation,
                }))}
            />

            {insulationType !== "Customizado" ? (
              <Select
                label="Espessura do isolamento"
                value={insulationThickness}
                onChange={setInsulationThickness}
                options={Object.keys(
                  // O ?. continua aqui para garantir que a tela nunca congele
                  INSULATION[insulationType]?.[nominalDia] || {},
                ).map((d) => ({
                  value: d,
                  label: `${d} mm`,
                }))}
              />
            ) : (
              <InputGroup
                label="Espessura do isolamento"
                value={insulationThickness}
                onChange={setInsulationThickness}
                unit="mm"
              />
            )}

            <InputGroup
              label="Massa"
              value={insulationMass}
              onChange={setInsulationMass}
              unit="kg/"
              disabled={insulationType !== "Customizado"}
            />
          </Card>

          <Card titulo="3. Fluido">
            <Select
              label="Tipo de Fluido"
              value={fluidType}
              onChange={setFluidType}
              options={Object.keys(FLUIDS || {})
                .concat("Customizado")
                .map((fluid) => ({
                  value: fluid,
                  label: fluid,
                }))}
            />

            <InputGroup
              label="Densidade do Fluido"
              value={fluidDensity}
              onChange={setFluidDensity}
              unit="kg/m³"
              disabled={fluidType !== "Customizado"}
            />
          </Card>

          {/* CARGAS */}
          <Card titulo="4. Cargas">
            <InputGroup
              label="Carga Distribuída do Tubo"
              value={loadPipe}
              onChange={setLoadPipe}
              unit="N/m"
              disabled={true}
            />

            <InputGroup
              label="Carga Distribuída do Isolamento"
              value={loadInsulation}
              onChange={setLoadInsulation}
              unit="N/m"
              disabled={true}
            />


            <InputGroup
              label="Carga Distribuída do Fluido"
              value={loadFluid}
              onChange={setLoadFluid}
              unit="N/m"
              disabled={true}
            />
            <InputGroup
              label="Carga Pontual (P)"
              value={loadPoint}
              onChange={setLoadPoint}
              unit="N"
            />
          </Card>

          {/* 5. FLECHA E CÁLCULO */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Decoração de Fundo */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <Settings
                size={150}
                className="animate-[spin_20s_linear_infinite]"
              />
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    5. Limite de Flecha
                  </h2>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <InputGroup
                    label="Flecha Máxima Permitida (δ)"
                    value={maxDeflection}
                    onChange={setMaxDeflection}
                    unit="mm"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Geralmente especificado por norma (ex: L/360 ou limite
                    absoluto em mm).
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={calculateSpan}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  <Calculator className="w-5 h-5" />
                  Calcular Vão Máximo
                </button>
              </div>

              {maxSpan !== null && (
                <div className="mt-4 bg-emerald-900/40 border border-emerald-500/30 p-4 rounded-lg text-center animate-[pulse_1s_ease-in-out_1]">
                  <p className="text-emerald-400 text-sm font-medium mb-1">
                    Vão Máximo Recomendado (L)
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {maxSpan.toFixed(2)}{" "}
                    <span className="text-xl text-emerald-200 font-normal">
                      m
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
