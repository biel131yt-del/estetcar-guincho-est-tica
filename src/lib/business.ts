export const BUSINESS = {
  name: "Guincho 24 Horas Estetcar",
  short: "Estetcar",
  phoneDisplay: "(51) 99802-6941",
  phoneRaw: "5551998026941",
  region: "São Jerônimo, Charqueadas e Região Carbonífera – RS",
  mapsUrl:
    "https://www.google.com/maps/place/Guincho+24+horas+estetcar/@-29.9610881,-51.6874006,17z",
  lat: -29.9610881,
  lng: -51.6874006,
};

export const EMERGENCY_MESSAGE = "Olá, Estetcar! Preciso de socorro automotivo agora. Vou enviar minha localização.";

export function whatsappLink(message = EMERGENCY_MESSAGE) {
  return `https://wa.me/${BUSINESS.phoneRaw}?text=${encodeURIComponent(message)}`;
}

export const SERVICES = [
  { icon: "🚛", title: "Reboque de veículos", text: "Carros, SUVs e utilitários transportados com prancha e total segurança." },
  { icon: "🏍️", title: "Transporte de motos", text: "Fixação profissional para motos de todas as cilindradas." },
  { icon: "🔋", title: "Carga de bateria", text: "Bateria arriou? Damos a partida no local, sem precisar rebocar." },
  { icon: "🛞", title: "Troca de pneu", text: "Pneu furado na estrada? Chegamos rápido e fazemos a troca." },
  { icon: "⛽", title: "Pane seca", text: "Ficou sem combustível? Levamos ajuda até você." },
  { icon: "🛣️", title: "Viagens e longas distâncias", text: "Transporte intermunicipal e interestadual com agendamento." },
];

