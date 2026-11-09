import { Card, InputGroup, Select } from "../componentes/Componentes";
import SHEET_DATA from "../dados/galvanized_steel_sheet_data.json";

export default function DuctWeight() {
  const [ductData, setDuctData] = useState({
    width: 0,
    height: 0,
    length: 0,
  });
  const ductArea = ((2 * ductData.width) / 100) * ((2 * ductData.height) / 100); // Convert cm to m
  const ductMass = ductArea * sheetMass;

  const [sheetTickness, setSheetThickness] = useState(0.8);
  const sheetMass =
    SHEET_DATA.find((sheet) => sheet.thickness === sheetTickness)?.mass || 0;

  return (
    <div className="div">
      <Card titulo={"Dados do duto"}>
        <InputGroup
          label={"Largura"}
          value={ductData.width}
          onChange={(value) => setDuctData({ ...ductData, width: value })}
          unit={"cm"}
        />
        <InputGroup
          label={"Altura"}
          value={ductData.height}
          onChange={(value) => setDuctData({ ...ductData, height: value })}
          unit={"cm"}
        />
        <InputGroup
          label={"Comprimento"}
          value={ductData.length}
          onChange={(value) => setDuctData({ ...ductData, length: value })}
          unit={"cm"}
        />
        <InputGroup
          label={"Massa do duto"}
          value={ductMass}
          unit={"kg"}
          disabled={true}
        />
      </Card>

      <Card titulo={"Dados da chapa de aço galvanizado"}>
        <Select
          label={"Espessura da chapa"}
          options={SHEET_DATA.map((sheet) => ({
            value: sheet.thickness,
            label: `${sheet.thickness} mm`,
          }))}
          onChange={(value) => setSheetThickness(value)}
        />

        <InputGroup
          label={"Massa da chapa"}
          value={sheetMass}
          unit={"kg/m²"}
          disabled={true}
        />
      </Card>
    </div>
  );
}
