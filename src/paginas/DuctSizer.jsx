import { Card, InputGroup } from "../componentes/Componentes";
import { calculateReynoldsNumber, calculateFrictionFactor, calculatePressureDrop, calculateHydraulicDiameter } from "../util/util"



const Input = ({ type, value, onChange, disabled }) => {
    return (
        <input
            type={type}
            step="any"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${disabled ? "bg-slate-100 text-slate-500" : "bg-white"}`}
        />)
}


function ItemLine({ ductData, onChange, props }) {

    const velocity = (ductData.flowRate / 3600) / ((ductData.width / 100) * (ductData.height / 100));
    const hydraulicDiameter = calculateHydraulicDiameter(ductData.width, ductData.height);
    const reynoldsNumber = calculateReynoldsNumber(props.density, velocity, hydraulicDiameter, props.viscosity);
    const frictionFactor = calculateFrictionFactor(reynoldsNumber, props.k, hydraulicDiameter);
    const pressureDrop = calculatePressureDrop(frictionFactor, ductData.length, props.density, velocity, hydraulicDiameter);

    return (
        <div className="grid grid-cols-7 gap-2">

            <Input type="text" value={ductData.tag} onChange={(value) => onChange({ ...ductData, tag: value })} />
            <Input type="number" value={ductData.flowRate} onChange={(value) => onChange({ ...ductData, flowRate: value })} />
            <Input type="number" value={ductData.width} onChange={(value) => onChange({ ...ductData, width: value })} />
            <Input type="number" value={ductData.height} onChange={(value) => onChange({ ...ductData, height: value })} />
            <Input type="number" value={ductData.length} onChange={(value) => onChange({ ...ductData, length: value })} />
            <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                {velocity.toFixed(2)}
            </label>
            <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                {pressureDrop.toFixed(2)}
            </label>

        </div>
    );
}

export function DuctSizer() {

    const airMaterialProps = {
        temperature: 20, // °C
        density: 1.2, // kg/m³
        viscosity: 1.8e-5, // Pa·s (N·s/m²)
        roughness: 0.00015 // m (for galvanized steel)
    }

    const [ducts, setDucts] = useState([])

    
    return (
        <div className="div">


            <Card titulo={"Dados do ar"}>

                <InputGroup label={"Temperatura"} value={airMaterialProps.temperature} onChange={setAirTemperature} unit={"°C"} />
                <InputGroup label={"Densidade"} value={airMaterialProps.density} onChange={(value) => { }} unit={"kg/m³"} />
                <InputGroup label={"Viscosidade"} value={airMaterialProps.viscosity} onChange={(value) => { }} unit={"kg/m³"} />
                <InputGroup label={"Rugosidade"} value={airMaterialProps.roughness} onChange={(value) => { }} unit={"kg/m³"} />

            </Card>

            <Card titulo={"Dados do duto"}>

                <div className="grid grid-cols-7 gap-2">

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Vazão (m³/h)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Largura (cm)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Altura (cm)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Velocidade (m/s)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Vazão (m³/s)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Comprimento (m)"
                    </label>

                    <label className="block text-center text-xs font-medium text-slate-600 mb-1">
                        "Perda de carga (Pa)"
                    </label>
                </div>

                {ducts.map((duct, index) => (
                    <ItemLine
                    ductData={duct}
                    props={airMaterialProps}
                    key={duct.tag}
                    onChange={(updatedDuct) => setDucts((currentDucts) => currentDucts.map((currentDuct, ductIndex) => ductIndex === index ? updatedDuct : currentDuct))}
                    />
                ))}
            </Card>

        </div>
    )
}