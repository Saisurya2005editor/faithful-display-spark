/**
 * BISmart sample dataset.
 *
 * SAMPLE DATA ONLY — shaped so it can later be swapped for real BIS documents
 * ingested into a database (documents / schemes / labs / products_map).
 */

export type StandardStatus = "Active" | "Superseded" | "Under revision";
export type DataOrigin = "Sample" | "Verified source";
export type Enforcement = "ISI Mark (Mandatory)" | "CRS (Mandatory)" | "Hallmarking (Mandatory)" | "Voluntary";

export interface BISStandard {
  id: string;
  standardNumber: string;
  title: string;
  division: string;
  sector: string;
  year: number;
  status: StandardStatus;
  enforcement: Enforcement;
  summary: string;
  tags: string[];
  productKeywords: string[];
  tests: string[];
  clauses: { ref: string; heading: string; excerpt: string }[];
  relatedStandards: string[];
  schemeId: string;
  sourceUrl: string;
  dataOrigin: DataOrigin;
}

export interface BISScheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  eligibility: string;
  documentsRequired: string[];
  steps: { title: string; detail: string; duration: string }[];
  sourceUrl: string;
  dataOrigin: DataOrigin;
}

export interface TestingLab {
  id: string;
  name: string;
  city: string;
  state: string;
  recognizedScope: string[];
  contact: string;
  email: string;
  sourceUrl: string;
  dataOrigin: DataOrigin;
}

const BIS_SOURCE = "https://www.bis.gov.in";

export const standards: BISStandard[] = [
  {
    id: "std-302-2-201",
    standardNumber: "IS 302-2-201",
    title: "Safety of household and similar electrical appliances — Particular requirements for electric kettles",
    division: "Electrotechnical (ETD)",
    sector: "Electrical Appliances",
    year: 2019,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Particular safety requirements for electric kettles and jug kettles for household use, covering temperature rise, dry-boil protection, leakage current and marking.",
    tags: ["kettle", "household appliance", "safety", "ISI"],
    productKeywords: ["electric kettle", "kettle", "jug kettle", "water boiler", "tea kettle"],
    tests: ["Temperature rise test", "Leakage current and electric strength", "Dry-boil protection", "Stability and mechanical hazards"],
    clauses: [
      {
        ref: "Clause 7.1",
        heading: "Marking and instructions",
        excerpt:
          "Appliances shall be marked with rated voltage, rated power input, manufacturer's name or trade mark and model reference, in a durable and legible manner.",
      },
      {
        ref: "Clause 11",
        heading: "Heating",
        excerpt:
          "Under normal operation, temperature rise of handles, knobs and grips shall not exceed the limits specified; kettles shall not attain excessive temperature when operated without water.",
      },
    ],
    relatedStandards: ["IS 302-1", "IS 694"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-302-1",
    standardNumber: "IS 302-1",
    title: "Safety of household and similar electrical appliances — General requirements",
    division: "Electrotechnical (ETD)",
    sector: "Electrical Appliances",
    year: 2008,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "General safety requirements applicable to all household electrical appliances, used together with the relevant particular requirements part.",
    tags: ["general requirements", "appliance safety"],
    productKeywords: ["household appliance", "mixer", "iron", "appliance safety"],
    tests: ["Input and current", "Earthing continuity", "Insulation resistance", "Abnormal operation"],
    clauses: [
      {
        ref: "Clause 8",
        heading: "Protection against access to live parts",
        excerpt:
          "Appliances shall be so constructed and enclosed that there is adequate protection against accidental contact with live parts.",
      },
    ],
    relatedStandards: ["IS 302-2-201", "IS 3010"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-2082",
    standardNumber: "IS 2082",
    title: "Stationary storage type electric water heaters (geysers) — Specification",
    division: "Electrotechnical (ETD)",
    sector: "Electrical Appliances",
    year: 2019,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for stationary storage type electric water heaters including thermal insulation, pressure, thermostat and safety cut-out performance.",
    tags: ["geyser", "water heater", "ISI"],
    productKeywords: ["geyser", "water heater", "storage water heater", "immersion heater"],
    tests: ["Thermal performance", "Hydraulic pressure test", "Thermostat and cut-out test", "Corrosion resistance"],
    clauses: [
      {
        ref: "Clause 6.3",
        heading: "Safety devices",
        excerpt:
          "Every water heater shall be fitted with a non-self-resetting thermal cut-out in addition to the thermostat, and a pressure relief device.",
      },
    ],
    relatedStandards: ["IS 302-2-21", "IS 694"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-374",
    standardNumber: "IS 374",
    title: "Electric ceiling type fans and regulators — Specification",
    division: "Electrotechnical (ETD)",
    sector: "Electrical Appliances",
    year: 2019,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Construction, performance and safety requirements for ceiling fans and their regulators, including air delivery and service value.",
    tags: ["fan", "ceiling fan", "energy"],
    productKeywords: ["ceiling fan", "fan", "fan regulator"],
    tests: ["Air delivery test", "Service value", "Insulation resistance", "Temperature rise"],
    clauses: [
      {
        ref: "Clause 9.1",
        heading: "Air delivery",
        excerpt:
          "The air delivery of the fan when measured at rated voltage and frequency shall not be less than the value declared by the manufacturer.",
      },
    ],
    relatedStandards: ["IS 302-2-80"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-694",
    standardNumber: "IS 694",
    title: "PVC insulated unsheathed and sheathed cables/cords with rigid and flexible conductor",
    division: "Electrotechnical (ETD)",
    sector: "Wires and Cables",
    year: 2010,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for PVC insulated cables and cords up to 1100 V used for internal wiring and appliance connection.",
    tags: ["cable", "wire", "PVC", "ISI"],
    productKeywords: ["wire", "cable", "house wiring", "flexible cord", "pvc cable"],
    tests: ["Conductor resistance", "Insulation thickness", "High voltage test", "Flammability"],
    clauses: [
      {
        ref: "Clause 5.2",
        heading: "Conductor resistance",
        excerpt:
          "The resistance of conductors at 20 °C shall not exceed the maximum values specified for the corresponding nominal cross-sectional area.",
      },
    ],
    relatedStandards: ["IS 1554", "IS 8130"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-4151",
    standardNumber: "IS 4151",
    title: "Protective helmets for two-wheeler riders — Specification",
    division: "Transport Engineering (TED)",
    sector: "Personal Protective Equipment",
    year: 2015,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for protective helmets for riders of two-wheeled motor vehicles, including shock absorption, penetration resistance and retention system.",
    tags: ["helmet", "two wheeler", "safety", "ISI"],
    productKeywords: ["helmet", "two wheeler helmet", "motorcycle helmet", "riding helmet"],
    tests: ["Shock absorption", "Penetration resistance", "Retention system strength", "Field of vision"],
    clauses: [
      {
        ref: "Clause 6.1",
        heading: "Shock absorption",
        excerpt:
          "When tested at the specified impact sites, the peak acceleration transmitted to the headform shall not exceed 300 g.",
      },
      {
        ref: "Clause 9",
        heading: "Mass of helmet",
        excerpt: "The mass of a full-face helmet, complete with all accessories, shall not exceed 1.2 kg.",
      },
    ],
    relatedStandards: ["IS 4151 Amendment 3"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-269",
    standardNumber: "IS 269",
    title: "Ordinary Portland Cement — Specification",
    division: "Civil Engineering (CED)",
    sector: "Cement and Concrete",
    year: 2015,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Specification for Ordinary Portland Cement of grades 33, 43 and 53 including chemical composition and compressive strength requirements.",
    tags: ["cement", "OPC", "construction"],
    productKeywords: ["cement", "opc", "portland cement", "construction material"],
    tests: ["Compressive strength", "Fineness", "Setting time", "Soundness"],
    clauses: [
      {
        ref: "Clause 7.2",
        heading: "Compressive strength",
        excerpt:
          "The average compressive strength of at least three mortar cubes shall meet the minimum values specified for 3, 7 and 28 days for each grade.",
      },
    ],
    relatedStandards: ["IS 1489", "IS 8112", "IS 4031"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-8112",
    standardNumber: "IS 8112",
    title: "43 Grade Ordinary Portland Cement — Specification",
    division: "Civil Engineering (CED)",
    sector: "Cement and Concrete",
    year: 2013,
    status: "Superseded",
    enforcement: "ISI Mark (Mandatory)",
    summary: "Requirements for 43 grade OPC; largely merged into IS 269 for current grades.",
    tags: ["cement", "43 grade"],
    productKeywords: ["43 grade cement", "cement"],
    tests: ["Compressive strength", "Fineness"],
    clauses: [
      {
        ref: "Clause 6",
        heading: "Physical requirements",
        excerpt: "Cement shall comply with the fineness, setting time, soundness and strength requirements specified.",
      },
    ],
    relatedStandards: ["IS 269"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-1786",
    standardNumber: "IS 1786",
    title: "High strength deformed steel bars and wires for concrete reinforcement (TMT)",
    division: "Metallurgical Engineering (MTD)",
    sector: "Steel",
    year: 2008,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for high strength deformed bars (Fe 415 to Fe 600) used as concrete reinforcement, including chemical composition and mechanical properties.",
    tags: ["TMT", "rebar", "steel", "construction"],
    productKeywords: ["tmt bar", "steel bar", "reinforcement steel", "rebar", "deformed bar"],
    tests: ["Tensile test", "Bend and rebend test", "Chemical analysis", "Mass per metre"],
    clauses: [
      {
        ref: "Clause 8.1",
        heading: "Mechanical properties",
        excerpt:
          "The 0.2 percent proof stress, tensile strength and percentage elongation shall not be less than the values specified for the relevant grade.",
      },
    ],
    relatedStandards: ["IS 2062", "IS 432"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-2062",
    standardNumber: "IS 2062",
    title: "Hot rolled medium and high tensile structural steel — Specification",
    division: "Metallurgical Engineering (MTD)",
    sector: "Steel",
    year: 2011,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary: "Grades, chemical composition and mechanical properties of hot rolled structural steel plates and sections.",
    tags: ["structural steel", "plates"],
    productKeywords: ["structural steel", "steel plate", "angle", "channel", "beam"],
    tests: ["Tensile test", "Impact test", "Chemical analysis"],
    clauses: [
      {
        ref: "Clause 9",
        heading: "Tensile test",
        excerpt: "Tensile test shall be carried out on test pieces selected in accordance with the sampling requirements.",
      },
    ],
    relatedStandards: ["IS 1786"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-14543",
    standardNumber: "IS 14543",
    title: "Packaged drinking water (other than packaged natural mineral water) — Specification",
    division: "Food and Agriculture (FAD)",
    sector: "Food and Beverages",
    year: 2016,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for packaged drinking water including microbiological, chemical and pesticide residue limits, and packaging and labelling.",
    tags: ["packaged water", "drinking water", "food"],
    productKeywords: ["packaged drinking water", "bottled water", "water plant", "mineral water"],
    tests: ["Microbiological test", "Heavy metals", "Pesticide residues", "Total dissolved solids"],
    clauses: [
      {
        ref: "Clause 4.3",
        heading: "Microbiological requirements",
        excerpt:
          "Packaged drinking water shall be free from coliform organisms; total viable colony count shall not exceed the specified limits at 20-22 °C and 37 °C.",
      },
    ],
    relatedStandards: ["IS 13428", "IS 10500"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-13428",
    standardNumber: "IS 13428",
    title: "Packaged natural mineral water — Specification",
    division: "Food and Agriculture (FAD)",
    sector: "Food and Beverages",
    year: 2005,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary: "Requirements for packaged natural mineral water drawn from a protected source, with minimal treatment.",
    tags: ["mineral water", "food"],
    productKeywords: ["natural mineral water", "spring water", "mineral water"],
    tests: ["Source assessment", "Microbiological test", "Mineral composition"],
    clauses: [
      {
        ref: "Clause 5",
        heading: "Source requirements",
        excerpt: "The water shall be obtained directly from natural or drilled sources and shall be protected from pollution.",
      },
    ],
    relatedStandards: ["IS 14543"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-10500",
    standardNumber: "IS 10500",
    title: "Drinking water — Specification",
    division: "Food and Agriculture (FAD)",
    sector: "Water Quality",
    year: 2012,
    status: "Active",
    enforcement: "Voluntary",
    summary: "Acceptable and permissible limits for physical, chemical and bacteriological parameters of drinking water.",
    tags: ["drinking water", "quality"],
    productKeywords: ["drinking water quality", "tap water", "water testing"],
    tests: ["Physical parameters", "Chemical parameters", "Bacteriological test"],
    clauses: [
      {
        ref: "Table 1",
        heading: "Organoleptic and physical parameters",
        excerpt: "Turbidity shall have an acceptable limit of 1 NTU and permissible limit of 5 NTU in the absence of alternate source.",
      },
    ],
    relatedStandards: ["IS 14543"],
    schemeId: "scheme-lab",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-9873-1",
    standardNumber: "IS 9873-1",
    title: "Safety of toys — Part 1: Mechanical and physical properties",
    division: "Production and General Engineering (PGD)",
    sector: "Toys",
    year: 2019,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Mechanical and physical safety requirements for toys, covering small parts, sharp edges, cords and projectile toys.",
    tags: ["toys", "children", "safety"],
    productKeywords: ["toy", "toys", "soft toy", "plastic toy", "children toy"],
    tests: ["Small parts test", "Sharp edge and point test", "Drop and impact test", "Torque and tension test"],
    clauses: [
      {
        ref: "Clause 4.4",
        heading: "Small parts",
        excerpt:
          "Toys intended for children under 36 months shall not contain small parts that fit wholly within the small parts cylinder.",
      },
    ],
    relatedStandards: ["IS 9873-3", "IS 15644"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-9873-3",
    standardNumber: "IS 9873-3",
    title: "Safety of toys — Part 3: Migration of certain elements",
    division: "Production and General Engineering (PGD)",
    sector: "Toys",
    year: 2017,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary: "Maximum acceptable levels of migration of heavy elements such as lead, cadmium and chromium from toy materials.",
    tags: ["toys", "heavy metals"],
    productKeywords: ["toy paint", "toy material", "toy"],
    tests: ["Element migration test"],
    clauses: [
      {
        ref: "Clause 4",
        heading: "Migration limits",
        excerpt: "Migration of lead from toy materials shall not exceed the specified maximum limit in mg/kg.",
      },
    ],
    relatedStandards: ["IS 9873-1"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-1417",
    standardNumber: "IS 1417",
    title: "Grading, marking and hallmarking of gold and gold alloy jewellery/artefacts",
    division: "Chemical (CHD)",
    sector: "Precious Metals",
    year: 2016,
    status: "Active",
    enforcement: "Hallmarking (Mandatory)",
    summary:
      "Permitted finenesses for gold jewellery, hallmark composition including the BIS mark, purity in carat and fineness, and the six-digit alphanumeric HUID.",
    tags: ["gold", "hallmark", "HUID", "jewellery"],
    productKeywords: ["gold jewellery", "hallmarking", "gold ornament", "jeweller", "huid"],
    tests: ["Fineness by fire assay", "XRF screening", "Marking verification"],
    clauses: [
      {
        ref: "Clause 4.1",
        heading: "Permitted finenesses",
        excerpt:
          "Gold jewellery shall be graded in the permitted finenesses, including 14 carat (585), 18 carat (750), 20 carat (833), 22 carat (916) and 23 carat (958).",
      },
      {
        ref: "Clause 6",
        heading: "Hallmark components",
        excerpt:
          "The hallmark shall consist of the BIS standard mark, the purity/fineness grade and the six-digit alphanumeric HUID.",
      },
    ],
    relatedStandards: ["IS 2112", "IS 15766"],
    schemeId: "scheme-hallmark",
    sourceUrl: `${BIS_SOURCE}/hallmarking/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-2112",
    standardNumber: "IS 2112",
    title: "Fineness of silver and silver alloy jewellery/artefacts — Hallmarking",
    division: "Chemical (CHD)",
    sector: "Precious Metals",
    year: 2014,
    status: "Active",
    enforcement: "Hallmarking (Mandatory)",
    summary: "Permitted finenesses and hallmarking requirements for silver jewellery and artefacts.",
    tags: ["silver", "hallmark", "jewellery"],
    productKeywords: ["silver jewellery", "silver hallmarking", "silver ornament"],
    tests: ["Fineness determination", "Marking verification"],
    clauses: [
      {
        ref: "Clause 4",
        heading: "Grades of fineness",
        excerpt: "Silver jewellery shall conform to one of the permitted finenesses such as 990, 970, 925, 900, 835 and 800.",
      },
    ],
    relatedStandards: ["IS 1417"],
    schemeId: "scheme-hallmark",
    sourceUrl: `${BIS_SOURCE}/hallmarking/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-16102",
    standardNumber: "IS 16102",
    title: "Self-ballasted LED lamps for general lighting services — Safety and performance",
    division: "Electrotechnical (ETD)",
    sector: "Lighting",
    year: 2012,
    status: "Active",
    enforcement: "CRS (Mandatory)",
    summary:
      "Safety and performance requirements for self-ballasted LED lamps, covered under the Compulsory Registration Scheme for electronics.",
    tags: ["LED", "lamp", "CRS", "lighting"],
    productKeywords: ["led lamp", "led bulb", "bulb", "lighting"],
    tests: ["Photometric test", "Luminous flux maintenance", "EMI/EMC", "Insulation resistance"],
    clauses: [
      {
        ref: "Part 1, Clause 8",
        heading: "Insulation resistance and electric strength",
        excerpt:
          "Insulation resistance between live parts and accessible metal parts shall not be less than 4 MΩ after humidity treatment.",
      },
    ],
    relatedStandards: ["IS 16103", "IS 302-1"],
    schemeId: "scheme-crs",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-16103",
    standardNumber: "IS 16103",
    title: "LED modules for general lighting — Performance requirements",
    division: "Electrotechnical (ETD)",
    sector: "Lighting",
    year: 2012,
    status: "Active",
    enforcement: "CRS (Mandatory)",
    summary: "Performance requirements for LED modules including luminous efficacy, colour rendering and lifetime.",
    tags: ["LED module", "performance"],
    productKeywords: ["led module", "led driver", "led panel"],
    tests: ["Luminous efficacy", "Colour rendering index", "Endurance test"],
    clauses: [
      {
        ref: "Clause 5",
        heading: "Performance requirements",
        excerpt: "Declared luminous flux shall be maintained within the tolerance limits specified at the end of the endurance test.",
      },
    ],
    relatedStandards: ["IS 16102"],
    schemeId: "scheme-crs",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-2347",
    standardNumber: "IS 2347",
    title: "Domestic pressure cookers — Specification",
    division: "Mechanical Engineering (MED)",
    sector: "Kitchenware",
    year: 2017,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary:
      "Requirements for domestic pressure cookers including material, operating pressure, gasket, safety valve and burst strength.",
    tags: ["pressure cooker", "kitchen", "ISI"],
    productKeywords: ["pressure cooker", "cooker", "kitchenware"],
    tests: ["Burst pressure test", "Safety device test", "Endurance test", "Material composition"],
    clauses: [
      {
        ref: "Clause 8.2",
        heading: "Safety devices",
        excerpt:
          "Every pressure cooker shall be provided with at least one safety device in addition to the operating valve, which shall release pressure before the design limit is exceeded.",
      },
    ],
    relatedStandards: ["IS 21"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-13252",
    standardNumber: "IS 13252",
    title: "Information technology equipment — Safety (Part 1: General requirements)",
    division: "Electrotechnical (ETD)",
    sector: "Electronics and IT",
    year: 2010,
    status: "Active",
    enforcement: "CRS (Mandatory)",
    summary:
      "Safety requirements for IT and electronic equipment such as laptops, adapters, monitors and printers under the Compulsory Registration Scheme.",
    tags: ["IT equipment", "CRS", "electronics"],
    productKeywords: ["laptop", "adapter", "monitor", "printer", "power supply", "electronics"],
    tests: ["Electric strength", "Temperature rise", "Fire enclosure test", "Stability"],
    clauses: [
      {
        ref: "Clause 1.7",
        heading: "Marking and instructions",
        excerpt: "Equipment shall be marked with rated voltage, rated frequency, rated current and manufacturer's identification.",
      },
    ],
    relatedStandards: ["IS 16046"],
    schemeId: "scheme-crs",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-16046",
    standardNumber: "IS 16046",
    title: "Secondary cells and batteries containing alkaline or other non-acid electrolytes — Safety",
    division: "Electrotechnical (ETD)",
    sector: "Electronics and IT",
    year: 2018,
    status: "Active",
    enforcement: "CRS (Mandatory)",
    summary: "Safety requirements for lithium-ion cells and battery packs used in portable applications and power banks.",
    tags: ["battery", "lithium ion", "CRS", "power bank"],
    productKeywords: ["battery", "lithium battery", "power bank", "cell"],
    tests: ["Overcharge test", "Short circuit test", "Thermal abuse", "Crush test"],
    clauses: [
      {
        ref: "Clause 7.3",
        heading: "Abuse testing",
        excerpt: "Cells shall not explode or catch fire when subjected to the specified external short circuit and thermal abuse conditions.",
      },
    ],
    relatedStandards: ["IS 13252"],
    schemeId: "scheme-crs",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-15644",
    standardNumber: "IS 15644",
    title: "Safety of electric toys",
    division: "Production and General Engineering (PGD)",
    sector: "Toys",
    year: 2006,
    status: "Active",
    enforcement: "ISI Mark (Mandatory)",
    summary: "Safety requirements for toys having at least one function dependent on electricity.",
    tags: ["electric toys", "safety"],
    productKeywords: ["electric toy", "battery toy", "remote control toy"],
    tests: ["Heating test", "Electric strength", "Battery compartment safety"],
    clauses: [
      {
        ref: "Clause 9",
        heading: "Heating",
        excerpt: "Accessible surfaces of electric toys shall not attain a temperature rise exceeding the specified limits under normal use.",
      },
    ],
    relatedStandards: ["IS 9873-1"],
    schemeId: "scheme-isi",
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-7874",
    standardNumber: "IS 7874",
    title: "Aluminium alloy castings for general engineering purposes",
    division: "Metallurgical Engineering (MTD)",
    sector: "Metals",
    year: 2020,
    status: "Under revision",
    enforcement: "Voluntary",
    summary: "Composition and mechanical property requirements for aluminium alloy castings used in general engineering.",
    tags: ["aluminium", "castings"],
    productKeywords: ["aluminium casting", "alloy casting", "aluminium"],
    tests: ["Chemical analysis", "Tensile test", "Hardness test"],
    clauses: [
      {
        ref: "Clause 6",
        heading: "Mechanical properties",
        excerpt: "Castings shall meet the minimum tensile strength and elongation values prescribed for the designated alloy.",
      },
    ],
    relatedStandards: ["IS 617"],
    schemeId: "scheme-lab",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
  {
    id: "std-15883",
    standardNumber: "IS 15883",
    title: "Fire safety in buildings — Code of practice (selected parts)",
    division: "Civil Engineering (CED)",
    sector: "Construction Safety",
    year: 2009,
    status: "Active",
    enforcement: "Voluntary",
    summary: "Guidance on fire safety management, evacuation planning and fire fighting installations in buildings.",
    tags: ["fire safety", "buildings", "code of practice"],
    productKeywords: ["fire safety", "building safety", "evacuation"],
    tests: ["Not applicable — code of practice"],
    clauses: [
      {
        ref: "Clause 5",
        heading: "Fire safety management",
        excerpt: "Occupancies shall maintain a documented fire safety plan with responsibilities, drills and periodic inspection records.",
      },
    ],
    relatedStandards: ["IS 1641", "IS 2189"],
    schemeId: "scheme-training",
    sourceUrl: `${BIS_SOURCE}/standards/`,
    dataOrigin: "Sample",
  },
];

export const schemes: BISScheme[] = [
  {
    id: "scheme-isi",
    name: "Product Certification Scheme (ISI Mark)",
    shortName: "ISI Mark",
    description:
      "Licence to apply the BIS Standard Mark (ISI Mark) on a product manufactured in conformity with the relevant Indian Standard, backed by factory inspection and sample testing.",
    eligibility:
      "Any manufacturer with in-house production and testing facilities for the product covered by an Indian Standard. Applies to Indian factories; overseas factories use FMCS.",
    documentsRequired: [
      "Application form (Form-I) with fee",
      "Factory registration / Udyam or incorporation proof",
      "Manufacturing process flow chart and machinery list",
      "List of in-house test equipment and calibration certificates",
      "Test report from a BIS recognized laboratory",
      "Layout plan of the factory premises",
    ],
    steps: [
      { title: "Check eligibility", detail: "Confirm the product is covered by an Indian Standard and identify mandatory vs voluntary status.", duration: "1-2 days" },
      { title: "Prepare factory and test setup", detail: "Install required in-house testing facilities and calibrate equipment.", duration: "2-4 weeks" },
      { title: "Submit application online", detail: "Apply via the BIS Manakonline portal with documents and application fee.", duration: "1 day" },
      { title: "Preliminary factory inspection", detail: "A BIS officer verifies manufacturing capability, QC and testing competence, and draws samples.", duration: "2-4 weeks" },
      { title: "Independent sample testing", detail: "Samples are tested in a BIS recognized lab against the relevant Indian Standard.", duration: "2-3 weeks" },
      { title: "Grant of licence", detail: "On satisfactory inspection and test results, the licence to use the Standard Mark is granted.", duration: "1-2 weeks" },
      { title: "Surveillance and renewal", detail: "Periodic surveillance inspections and market samples; licence renewed with marking fee.", duration: "Annual / as per licence" },
    ],
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-crs",
    name: "Compulsory Registration Scheme",
    shortName: "CRS",
    description:
      "Self-declaration based registration for notified electronics and IT products. The manufacturer registers with BIS after testing in a BIS recognized lab and uses the Standard Mark with an R-number.",
    eligibility: "Manufacturers (Indian or foreign) of products notified under the Electronics and IT Goods Order.",
    documentsRequired: [
      "Online registration application",
      "Test report from BIS recognized lab (not older than 90 days)",
      "Business/factory registration documents",
      "Trademark authorization, if applicable",
      "Authorized Indian Representative details (for foreign manufacturers)",
    ],
    steps: [
      { title: "Confirm product is notified", detail: "Check the product against the notified electronics list and applicable IS.", duration: "1 day" },
      { title: "Test at BIS recognized lab", detail: "Submit samples for testing against the relevant Indian Standard.", duration: "2-4 weeks" },
      { title: "Apply for registration", detail: "File the online application with the test report and documents.", duration: "1 day" },
      { title: "Scrutiny and clarifications", detail: "BIS scrutinizes the application and may raise queries.", duration: "1-3 weeks" },
      { title: "Grant of registration", detail: "Registration number (R-number) granted; Standard Mark can be applied.", duration: "1-2 weeks" },
      { title: "Renewal and surveillance", detail: "Renew registration periodically; market surveillance samples may be drawn.", duration: "Every 2 years" },
    ],
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-hallmark",
    name: "Hallmarking of Precious Metal Jewellery",
    shortName: "Hallmarking",
    description:
      "Registration of jewellers to sell hallmarked gold and silver jewellery, with purity marked at BIS recognized Assaying and Hallmarking Centres and a unique HUID for traceability.",
    eligibility: "Jewellers selling gold or silver jewellery; registration is free and has no expiry in the current framework.",
    documentsRequired: [
      "Jeweller registration on the BIS portal",
      "GST registration certificate",
      "Proof of business address for each outlet",
      "Identity proof of the proprietor / partners / directors",
    ],
    steps: [
      { title: "Register as a jeweller", detail: "Register on the BIS hallmarking portal for each sales outlet.", duration: "2-5 days" },
      { title: "Choose an AHC", detail: "Select a BIS recognized Assaying and Hallmarking Centre to send jewellery to.", duration: "1 day" },
      { title: "Submit jewellery for assay", detail: "The AHC determines purity and applies the hallmark with HUID.", duration: "1-3 days per lot" },
      { title: "Sell hallmarked items only", detail: "Sell only HUID hallmarked jewellery in notified districts, and display the BIS hallmark information.", duration: "Ongoing" },
      { title: "Maintain records", detail: "Retain assay and HUID records; be ready for BIS surveillance and consumer purity checks.", duration: "Ongoing" },
    ],
    sourceUrl: `${BIS_SOURCE}/hallmarking/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-fmcs",
    name: "Foreign Manufacturers Certification Scheme",
    shortName: "FMCS",
    description:
      "Certification route for factories located outside India to obtain a licence to use the BIS Standard Mark on products exported to India.",
    eligibility: "Overseas manufacturing units producing goods covered by Indian Standards and intended for the Indian market.",
    documentsRequired: [
      "Application in the prescribed FMCS form with fees in USD",
      "Nomination of an Authorized Indian Representative",
      "Factory and quality documentation",
      "In-house test facility and calibration records",
      "Performance bank guarantee / agreement documents",
    ],
    steps: [
      { title: "Appoint an Authorized Indian Representative", detail: "A resident AIR is mandatory for all FMCS applications.", duration: "1-2 weeks" },
      { title: "Submit FMCS application", detail: "File the application with documents and prescribed fees.", duration: "1 week" },
      { title: "Recording and scrutiny", detail: "BIS records the application and raises clarifications if needed.", duration: "2-4 weeks" },
      { title: "Factory inspection abroad", detail: "BIS officers audit the overseas factory and draw samples.", duration: "4-8 weeks" },
      { title: "Testing and agreement", detail: "Samples tested in India or a recognized lab; licence agreement and bank guarantee executed.", duration: "4-6 weeks" },
      { title: "Grant and surveillance", detail: "Licence granted; periodic surveillance audits follow.", duration: "Annual" },
    ],
    sourceUrl: `${BIS_SOURCE}/product-certification/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-lab",
    name: "Laboratory Recognition Scheme",
    shortName: "Lab Recognition",
    description:
      "Recognition of independent third-party laboratories to test samples on behalf of BIS for certification and surveillance purposes.",
    eligibility: "NABL accredited laboratories with the required scope, equipment and qualified technical personnel.",
    documentsRequired: [
      "Application for recognition with the requested scope",
      "NABL accreditation certificate and scope",
      "Equipment list with calibration status",
      "Technical personnel qualifications",
      "Quality manual",
    ],
    steps: [
      { title: "Apply with scope", detail: "Submit the recognition application listing standards and products to be tested.", duration: "1-2 weeks" },
      { title: "Document review", detail: "BIS reviews accreditation, quality manual and capability.", duration: "3-4 weeks" },
      { title: "Lab assessment visit", detail: "Assessors verify equipment, competence and test procedures on site.", duration: "4-6 weeks" },
      { title: "Proficiency testing", detail: "Lab may be asked to test blind samples to demonstrate competence.", duration: "2-4 weeks" },
      { title: "Grant of recognition", detail: "Recognition granted for the approved scope, subject to periodic review.", duration: "2-3 weeks" },
    ],
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-clubs",
    name: "Standards Clubs",
    shortName: "Standards Clubs",
    description:
      "School and college level clubs mentored by BIS to build a quality and standards culture among students through activities, projects and visits.",
    eligibility: "Recognized schools and colleges with a nominated teacher mentor and a minimum group of students.",
    documentsRequired: [
      "Institution application with school/college details",
      "Nominated teacher mentor consent",
      "List of enrolled student members",
    ],
    steps: [
      { title: "Institution applies", detail: "School or college applies to the nearest BIS branch office.", duration: "1-2 weeks" },
      { title: "Mentor and members enrolled", detail: "A teacher mentor and student members are registered.", duration: "1 week" },
      { title: "Club activation", detail: "BIS provides guidance, standards literature and activity calendar.", duration: "2-4 weeks" },
      { title: "Activities and projects", detail: "Quizzes, industry visits, projects on standards and quality.", duration: "Academic year" },
    ],
    sourceUrl: `${BIS_SOURCE}/standards-clubs/`,
    dataOrigin: "Sample",
  },
  {
    id: "scheme-training",
    name: "Training and Capacity Building (NITS)",
    shortName: "Training",
    description:
      "Training programmes by the National Institute of Training for Standardization for industry, MSMEs, regulators and consumers on standards and certification.",
    eligibility: "Open to industry professionals, MSME staff, students, lab personnel and government officials.",
    documentsRequired: ["Nomination form from the organisation", "Participant details", "Course fee payment proof"],
    steps: [
      { title: "Browse the calendar", detail: "Check the published training calendar for relevant programmes.", duration: "1 day" },
      { title: "Nominate participants", detail: "Submit the nomination form with participant details.", duration: "1 week" },
      { title: "Confirmation and fees", detail: "Seat confirmed on payment of course fee.", duration: "1 week" },
      { title: "Attend and certify", detail: "Attend the programme and receive a participation certificate.", duration: "2-5 days" },
    ],
    sourceUrl: `${BIS_SOURCE}/training/`,
    dataOrigin: "Sample",
  },
];

export const labs: TestingLab[] = [
  {
    id: "lab-1",
    name: "Central Laboratory, Sahibabad",
    city: "Sahibabad",
    state: "Uttar Pradesh",
    recognizedScope: ["Electrical appliances", "Wires and cables", "LED lamps", "Pressure cookers"],
    contact: "+91 120 2895 000",
    email: "centrallab@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-2",
    name: "Northern Regional Testing Laboratory",
    city: "Mohali",
    state: "Punjab",
    recognizedScope: ["Cement", "Steel (TMT bars)", "Structural steel"],
    contact: "+91 172 2225 100",
    email: "nrl@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-3",
    name: "Western Regional Laboratory",
    city: "Mumbai",
    state: "Maharashtra",
    recognizedScope: ["Packaged drinking water", "Toys", "Electrical appliances"],
    contact: "+91 22 2493 1000",
    email: "wrl@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-4",
    name: "Southern Regional Laboratory",
    city: "Chennai",
    state: "Tamil Nadu",
    recognizedScope: ["Helmets", "Electronics and IT (CRS)", "Batteries"],
    contact: "+91 44 2254 1200",
    email: "srl@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-5",
    name: "Eastern Regional Laboratory",
    city: "Kolkata",
    state: "West Bengal",
    recognizedScope: ["Cement", "Packaged drinking water", "Wires and cables"],
    contact: "+91 33 2337 8800",
    email: "erl@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-6",
    name: "Deccan Materials Test House",
    city: "Hyderabad",
    state: "Telangana",
    recognizedScope: ["Steel (TMT bars)", "Cement", "Aluminium castings"],
    contact: "+91 40 2333 4455",
    email: "info@example-deccanlab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-7",
    name: "Cyberabad Electronics Test Centre",
    city: "Hyderabad",
    state: "Telangana",
    recognizedScope: ["Electronics and IT (CRS)", "LED lamps", "Batteries"],
    contact: "+91 40 2789 1100",
    email: "labs@example-cyberlab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-8",
    name: "Bengaluru Product Safety Labs",
    city: "Bengaluru",
    state: "Karnataka",
    recognizedScope: ["Helmets", "Toys", "Electrical appliances"],
    contact: "+91 80 2345 6789",
    email: "contact@example-bpsl.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-9",
    name: "Gujarat Industrial Testing Services",
    city: "Ahmedabad",
    state: "Gujarat",
    recognizedScope: ["Cement", "Wires and cables", "Packaged drinking water"],
    contact: "+91 79 2656 3300",
    email: "gits@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-10",
    name: "Jaipur Assaying and Hallmarking Centre",
    city: "Jaipur",
    state: "Rajasthan",
    recognizedScope: ["Gold hallmarking", "Silver hallmarking"],
    contact: "+91 141 2204 500",
    email: "ahc@example-jaipur.in",
    sourceUrl: `${BIS_SOURCE}/hallmarking/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-11",
    name: "Coimbatore Appliance Test House",
    city: "Coimbatore",
    state: "Tamil Nadu",
    recognizedScope: ["Ceiling fans", "Electrical appliances", "Water heaters"],
    contact: "+91 422 2334 990",
    email: "catl@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-12",
    name: "Pune Polymer and Toy Testing Lab",
    city: "Pune",
    state: "Maharashtra",
    recognizedScope: ["Toys", "Plastics", "Electric toys"],
    contact: "+91 20 2567 4411",
    email: "ptt@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-13",
    name: "Visakhapatnam Metals Laboratory",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    recognizedScope: ["Structural steel", "Steel (TMT bars)"],
    contact: "+91 891 2705 300",
    email: "vml@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-14",
    name: "Indore Water Quality Laboratory",
    city: "Indore",
    state: "Madhya Pradesh",
    recognizedScope: ["Packaged drinking water", "Drinking water quality"],
    contact: "+91 731 2493 220",
    email: "iwql@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
  {
    id: "lab-15",
    name: "Guwahati Regional Test Centre",
    city: "Guwahati",
    state: "Assam",
    recognizedScope: ["Cement", "Electrical appliances", "Helmets"],
    contact: "+91 361 2334 112",
    email: "grtc@example-lab.in",
    sourceUrl: `${BIS_SOURCE}/laboratory/`,
    dataOrigin: "Sample",
  },
];

export const productCategories = [
  "Electrical Appliances",
  "Wires and Cables",
  "Lighting",
  "Electronics and IT",
  "Personal Protective Equipment",
  "Cement and Concrete",
  "Steel",
  "Food and Beverages",
  "Toys",
  "Precious Metals",
  "Kitchenware",
  "Other",
];

export const exampleQueries = [
  "Which BIS standard applies to electric kettles?",
  "How do I get an ISI mark?",
  "Hallmarking rules for gold jewellery",
  "Labs for testing helmets",
  "Is CRS mandatory for LED bulbs?",
  "What tests are needed for TMT bars?",
];

export const findStandards = (query: string): BISStandard[] => {
  const q = query.toLowerCase();
  if (!q.trim()) return [];
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  return standards
    .map((s) => {
      let score = 0;
      const haystack = [
        s.standardNumber,
        s.title,
        s.summary,
        s.sector,
        ...s.tags,
        ...s.productKeywords,
      ]
        .join(" ")
        .toLowerCase();

      for (const kw of s.productKeywords) {
        if (q.includes(kw)) score += 40;
      }
      if (q.includes(s.standardNumber.toLowerCase())) score += 60;
      for (const w of words) {
        if (haystack.includes(w)) score += 8;
      }
      return { s, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.s);
};

export const getScheme = (id: string) => schemes.find((s) => s.id === id);
