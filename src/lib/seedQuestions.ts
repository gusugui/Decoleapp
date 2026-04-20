import { db } from "./firebase";
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore";
import { Question } from "../types";

const questions: Omit<Question, "id" | "createdAt">[] = [
  {
    subject: "Meteorologia",
    statement: "Qual é o fenômeno meteorológico caracterizado pela redução da visibilidade horizontal para menos de 1000 metros devido à suspensão de gotículas de água na atmosfera?",
    options: { a: "Névoa úmida", b: "Nevoeiro", c: "Névoa seca", d: "Precipitação" },
    correctAnswer: "b",
    explanation: "O nevoeiro é definido como a suspensão de gotículas de água que reduz a visibilidade a menos de 1 km.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "Qual é a separação vertical mínima entre aeronaves voando sob IFR abaixo do FL290?",
    options: { a: "500 pés", b: "1000 pés", c: "2000 pés", d: "300 pés" },
    correctAnswer: "b",
    explanation: "Abaixo do FL290, a separação vertical padrão IFR é de 1000 pés.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "O ângulo formado entre a corda da asa e o vento relativo é chamado de:",
    options: { a: "Ângulo de incidência", b: "Ângulo de ataque", c: "Ângulo de diedro", d: "Ângulo de enflechamento" },
    correctAnswer: "b",
    explanation: "Ângulo de ataque é o ângulo entre a corda do aerofólio e a direção do vento relativo.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "Uma milha náutica (NM) equivale a aproximadamente quantos metros?",
    options: { a: "1000 m", b: "1609 m", c: "1852 m", d: "2000 m" },
    correctAnswer: "c",
    explanation: "Uma milha náutica é padronizada internacionalmente como 1.852 metros.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "Qual componente do motor a pistão transforma o movimento retilíneo em circular?",
    options: { a: "Pistão", b: "Biela", c: "Eixo de manivelas (Vira-brequim)", d: "Válvulas" },
    correctAnswer: "c",
    explanation: "O eixo de manivelas é responsável por converter o movimento de vaivém dos pistões em movimento rotativo.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "Nuvens que apresentam desenvolvimento vertical e estão associadas a tempestades e trovoadas são denominadas:",
    options: { a: "Cirrus", b: "Stratus", c: "Cumulonimbus", d: "Altocumulus" },
    correctAnswer: "c",
    explanation: "As nuvens Cumulonimbus (CB) são nuvens de grande desenvolvimento vertical associadas a instabilidade atmosférica e tempestades.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "Qual é o código transponder que deve ser selecionado em caso de interferência ilícita (seqüestro)?",
    options: { a: "7500", b: "7600", c: "7700", d: "2000" },
    correctAnswer: "a",
    explanation: "7500 é para interferência ilícita, 7600 falha de comunicação e 7700 emergência.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "A função do sistema de lubrificação em um motor aeronáutico é:",
    options: { a: "Apenas reduzir o atrito", b: "Reduzir atrito, refrigerar, limpar e vedar", c: "Aumentar a temperatura do motor", d: "Controlar a mistura ar/combustível" },
    correctAnswer: "b",
    explanation: "O óleo lubrificante reduz o atrito, ajuda na refrigeração retirando calor, limpa resíduos e auxilia na vedação dos anéis.",
    difficulty: "easy",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "A linha que une pontos de mesma declinação magnética chama-se:",
    options: { a: "Isogônica", b: "Agônica", c: "Isoclínica", d: "Isobárica" },
    correctAnswer: "a",
    explanation: "Linhas isogônicas unem pontos com a mesma declinação magnética.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "Qual comando é responsável pelo movimento de arfagem (pitch)?",
    options: { a: "Ailerons", b: "Leme de direção", c: "Profundor", d: "Compensador" },
    correctAnswer: "c",
    explanation: "O profundor, localizado na cauda (estabilizador horizontal), controla o movimento de arfagem em torno do eixo lateral.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "A camada da atmosfera mais baixa, onde ocorrem os fenômenos meteorológicos, é a:",
    options: { a: "Estratosfera", b: "Troposfera", c: "Mesosfera", d: "Ionosfera" },
    correctAnswer: "b",
    explanation: "A troposfera é a camada em contato com a superfície terrestre, onde a temperatura diminui com a altitude e ocorrem as nuvens.",
    difficulty: "easy",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "Vento que sopra do mar para a terra durante o dia chama-se:",
    options: { a: "Brisa terrestre", b: "Brisa marítima", c: "Convecção", d: "Advecção" },
    correctAnswer: "b",
    explanation: "A brisa marítima ocorre durante o dia quando a terra aquece mais rápido que o mar, criando uma zona de baixa pressão no continente.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "Qual luz de navegação está localizada na ponta da asa direita (estibordo)?",
    options: { a: "Vermelha", b: "Verde", c: "Branca", d: "Amarela" },
    correctAnswer: "b",
    explanation: "As luzes de navegação padrão são: Verde (Direita/Estibordo), Vermelha (Esquerda/Bombordo) e Branca (Cauda).",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "A força que se opõe ao peso de uma aeronave em voo nivelado é a:",
    options: { a: "Tração", b: "Sustentação", c: "Arrasto", d: "Gravidade" },
    correctAnswer: "b",
    explanation: "A sustentação é a força aerodinâmica gerada pelas asas que equilibra o peso da aeronave.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "O meridiano de referência para longitudes é:",
    options: { a: "Linha do Equador", b: "Meridiano de Greenwich", c: "Trópico de Câncer", d: "Círculo Polar" },
    correctAnswer: "b",
    explanation: "O Meridiano de Greenwich é o meridiano de 0° de longitude.",
    difficulty: "easy",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "O sistema encarregado de fornecer a faísca nas velas de ignição de forma independente do sistema elétrico principal é o:",
    options: { a: "Bateria", b: "Alternador", c: "Magneto", d: "Motor de partida" },
    correctAnswer: "c",
    explanation: "Os magnetos geram alta tensão para as velas de ignição de forma independente, garantindo a continuidade do motor em caso de falha elétrica.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "A velocidade que garante a maior distância percorrida em relação ao solo para uma determinada quantidade de combustível é a velocidade de:",
    options: { a: "Máximo alcance (Maximum Range)", b: "Máxima autonomia (Maximum Endurance)", c: "Estol", d: "VNE" },
    correctAnswer: "a",
    explanation: "O máximo alcance otimiza a distância percorrida por quilo de combustível.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "O instrumento que mede a pressão atmosférica é o:",
    options: { a: "Termômetro", b: "Higrômetro", c: "Barômetro", d: "Anemômetro" },
    correctAnswer: "c",
    explanation: "O barômetro (geralmente aneroide em aviação) mede a pressão do ar.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Segurança de Voo",
    statement: "Em caso de fogo no motor durante o voo, qual deve ser a primeira ação do piloto?",
    options: { a: "Aumentar a potência", b: "Fechar a válvula seletora de combustível", c: "Abrir o aquecimento do carburador", d: "Ligar a bomba elétrica" },
    correctAnswer: "b",
    explanation: "Cortar o suprimento de combustível é prioridade para interromper a alimentação do incêndio.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Emergências",
    statement: "Qual é a frequência internacional de emergência em VHF?",
    options: { a: "121.5 MHz", b: "123.45 MHz", c: "122.1 MHz", d: "118.1 MHz" },
    correctAnswer: "a",
    explanation: "121.5 MHz é a frequência de guarda internacional.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "O fenômeno do estol (stall) ocorre quando:",
    options: { a: "A velocidade é muito alta", b: "O ângulo de ataque excede o ângulo crítico", c: "O motor para de funcionar", d: "O avião entra em mergulho" },
    correctAnswer: "b",
    explanation: "O estol é a perda de sustentação devido ao descolamento da camada limite quando o ângulo de ataque é excessivo.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "Uma aeronave em aproximação para pouso tem prioridade sobre:",
    options: { a: "Aeronaves voando em rota", b: "Aeronaves em emergência", c: "Nenhuma aeronave", d: "Aeronaves planadores" },
    correctAnswer: "a",
    explanation: "Aeronaves em voo devem ceder passagem para aeronaves em aproximação final.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "Para converter proa verdadeira (PV) em proa magnética (PM), devemos utilizar a:",
    options: { a: "Declinação Magnética (DM)", b: "Desvio de Bússola (DB)", c: "Variação de Bússola", d: "Deriva" },
    correctAnswer: "a",
    explanation: "PM = PV +/- DM.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "A mistura rica é utilizada durante a decolagem principalmente para:",
    options: { a: "Economizar combustível", b: "Auxiliar no resfriamento do motor", c: "Diminuir a potência", d: "Evitar o gelo no carburador" },
    correctAnswer: "b",
    explanation: "O excesso de combustível na mistura rica absorve calor ao evaporar, ajudando a resfriar os cilindros em alta potência.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "Qual instrumento funciona baseado no princípio da pressão estática?",
    options: { a: "Velocímetro", b: "Altímetro", c: "Giro Direcional", d: "Horizonte Artificial" },
    correctAnswer: "b",
    explanation: "O altímetro e o variômetro usam apenas pressão estática; o velocímetro usa estática e pitot.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "A sigla METAR refere-se a:",
    options: { a: "Previsão de Aeródromo", b: "Relatório Meteorológico Regular de Aeródromo", c: "Carta de Ventos em Altitude", d: "Aviso de Tempestade" },
    correctAnswer: "b",
    explanation: "METAR (Meteorological Aerodrome Report) é a observação das condições atuais.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "O aumento do arrasto induzido é uma consequência direta do aumento de:",
    options: { a: "Velocidade", b: "Sustentação (coeficiente de sustentação)", c: "Densidade do ar", d: "Peso do motor" },
    correctAnswer: "b",
    explanation: "O arrasto induzido é gerado pela produção de sustentação, sendo maior em baixas velocidades e altos ângulos de ataque.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Segurança de Voo",
    statement: "Qual é o principal fator contribuinte para acidentes na aviação civil?",
    options: { a: "Falha mecânica", b: "Fator humano", c: "Condições meteorológicas", d: "Infraestrutura aeroportuária" },
    correctAnswer: "b",
    explanation: "Cerca de 70% a 80% dos acidentes têm o fator humano (erro de julgamento, cansaço, etc.) como causa raiz.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "O ângulo formado entre o Norte Verdadeiro (NV) e o Norte Magnético (NM) é chamado de:",
    options: { a: "Declinação Magnética", b: "Desvio de Bússola", c: "Proa Magnética", d: "Rumo Verdadeiro" },
    correctAnswer: "a",
    explanation: "A Declinação Magnética é o erro angular entre o polo geográfico e o magnético.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "O efeito solo (ground effect) resulta em:",
    options: { a: "Diminuição do arrasto induzido", b: "Aumento do arrasto induzido", c: "Diminuição da sustentação", d: "Dificuldade de decolagem" },
    correctAnswer: "a",
    explanation: "Perto do solo, os vórtices de ponta de asa são reduzidos, diminuindo o arrasto induzido e dando a sensação de 'colchão de ar'.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Instrumentos",
    statement: "Qual instrumento é considerado 'vácuo' ou 'giroscópico'?",
    options: { a: "Altímetro", b: "Horizonte Artificial", c: "Variômetro", d: "Velocímetro" },
    correctAnswer: "b",
    explanation: "O horizonte artificial, o giro direcional e o coordenador de curva são instrumentos giroscópicos.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "Uma hora de arco equivale a quantos minutos de tempo?",
    options: { a: "1 minuto", b: "4 minutos", c: "15 minutos", d: "60 minutos" },
    correctAnswer: "b",
    explanation: "A Terra gira 360° em 24h, logo 15° em 1h, e 1° a cada 4 minutos.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "O processo de transferência de calor através do movimento horizontal do ar chama-se:",
    options: { a: "Convecção", b: "Advecção", c: "Radiação", d: "Condução" },
    correctAnswer: "b",
    explanation: "Advecção é o transporte horizontal; convecção é o vertical.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "O transponder deve estar em modo ALT (C) para:",
    options: { a: "Apenas identificar a aeronave", b: "Transmitir a altitude de pressão", c: "Aumentar o alcance do rádio", d: "Não é necessário no Brasil" },
    correctAnswer: "b",
    explanation: "O modo C permite que o controle de tráfego aéreo veja a altitude da aeronave no radar.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "Qual é o efeito do uso de Flaps durante a aproximação?",
    options: { a: "Aumenta a sustentação e o arrasto", b: "Aumenta apenas a sustentação", c: "Diminui a sustentação", d: "Aumenta apenas a velocidade" },
    correctAnswer: "a",
    explanation: "Os flaps permitem voar mais devagar (mais sustentação) e aumentam o arrasto para permitir uma rampa de descida mais íngreme.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "A octanagem do combustível (Ex: AVGAS 100LL) indica:",
    options: { a: "A pureza do combustível", b: "A resistência à detonação", c: "A velocidade de queima", d: "O poder calorífico" },
    correctAnswer: "b",
    explanation: "Quanto maior a octanagem, mais compressão o combustível aguenta antes de entrar em combustão espontânea (detonação).",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "O gelo que se forma nos bordos de ataque e é caracterizado por ser quebradiço e opaco é o:",
    options: { a: "Gelo claro", b: "Gelo escuro", c: "Gelo amorfo (Rime Ice)", d: "Geada" },
    correctAnswer: "c",
    explanation: "Gelo Rime (escarcha) forma-se em gotas menores, prendendo ar e tornando-se opaco.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "Um avião voando com proa 090° e sofrendo vento de 360° terá uma deriva para:",
    options: { a: "Esquerda", b: "Direita", c: "Frente", d: "Trás" },
    correctAnswer: "b",
    explanation: "O vento de 360° (Norte) empurra o avião para o Sul, causando deriva à direita de quem voa para o Leste (090°).",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Segurança de Voo",
    statement: "A separação de CRM (Crew Resource Management) visa:",
    options: { a: "Melhorar a manutenção do motor", b: "Otimizar o uso de todos os recursos disponíveis para a segurança", c: "Treinar voo acrobático", d: "Aumentar a venda de passagens" },
    correctAnswer: "b",
    explanation: "CRM foca na comunicação, liderança e gestão de recursos na cabine para evitar erros.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "A temperatura padrão (ISA) ao nível do mar é de:",
    options: { a: "10°C", b: "15°C", c: "20°C", d: "25°C" },
    correctAnswer: "b",
    explanation: "ISA (International Standard Atmosphere): 15°C e 1013.25 hPa ao nível do mar.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "A linha de instabilidade (Squall Line) é geralmente associada a:",
    options: { a: "Frentes quentes", b: "Frentes frias de deslocamento rápido", c: "Massas de ar estáveis", d: "Inversões térmicas" },
    correctAnswer: "b",
    explanation: "Linhas de instabilidade são faixas de tempestades violentas que se movem à frente de frentes frias fortes.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "O 'shimmy' é um fenômeno vibratório indesejado que ocorre em:",
    options: { a: "Hélices", b: "Trem de pouso (bequilha/tri-ciclo)", c: "Ailerons", d: "Profundor" },
    correctAnswer: "b",
    explanation: "Shimmy é a oscilação rápida da roda do nariz ou bequilha durante a corrida de solo.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Emergências",
    statement: "O sinal de socorro radiotelefônico internacional é:",
    options: { a: "MAYDAY", b: "PAN PAN", c: "S.O.S", d: "BREAK BREAK" },
    correctAnswer: "a",
    explanation: "MAYDAY indica perigo iminente e grave; PAN PAN indica urgência.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "Qual é o efeito do centro de gravidade (CG) muito à frente?",
    options: { a: "Mais estabilidade e dificuldade de arfagem", b: "Menos estabilidade", c: "Mais velocidade de cruzeiro", d: "Facilidade de pouso" },
    correctAnswer: "a",
    explanation: "Um CG dianteiro aumenta a estabilidade longitudinal mas exige mais força no profundor para 'puxar' o nariz.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "O vôo VFR em rota dentro do espaço aéreo classe G deve manter visibilidade mínima de:",
    options: { a: "1500 m", b: "3000 m", c: "5000 m", d: "8000 m" },
    correctAnswer: "c",
    explanation: "Para a maioria das aeronaves em rota VFR, a visibilidade mínima é de 5000m.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "A altitude de densidade aumenta quando:",
    options: { a: "A pressão cai ou a temperatura sobe", b: "A pressão sobe ou a temperatura cai", c: "A umidade diminui", d: "O avião fica mais pesado" },
    correctAnswer: "a",
    explanation: "Ar quente ou baixa pressão tornam o ar menos denso, simulando uma altitude maior para a performance da asa e do motor.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "O 'vapor lock' (travamento por vapor) ocorre no sistema de:",
    options: { a: "Lubrificação", b: "Combustível", c: "Arrefecimento", d: "Ignição" },
    correctAnswer: "b",
    explanation: "Ocorre quando o combustível vaporiza nas linhas de alimentação devido ao calor, interrompendo o fluxo.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "A projeção de Mercator é uma projeção do tipo:",
    options: { a: "Cônica", b: "Cilíndrica", c: "Azimutal", d: "Polar" },
    correctAnswer: "b",
    explanation: "A projeção de Mercator é a projeção cilíndrica tangente ao Equador.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Primeiros Socorros",
    statement: "Em caso de hipóxia (falta de oxigênio) em altitude, qual a primeira providência?",
    options: { a: "Aumentar a ventilação", b: "Descer para uma altitude menor", c: "Fazer massagem cardíaca", d: "Ligar o transponder" },
    correctAnswer: "b",
    explanation: "Descer para onde o ar é mais denso é a solução definitiva; usar O2 se disponível.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "A estabilidade em torno do eixo vertical é chamada de:",
    options: { a: "Estabilidade direcional", b: "Estabilidade lateral", c: "Estabilidade longitudinal", d: "Estabilidade estática" },
    correctAnswer: "a",
    explanation: "Eixo vertical = Direcional (Leme); Eixo Longitudinal = Lateral (Ailerons); Eixo Lateral = Longitudinal (Profundor).",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "O gradiente térmico padrão na troposfera é de aproximadamente:",
    options: { a: "2°C por 1000 pés", b: "0.65°C por 100 metros", c: "1°C por km", d: "As duas primeiras estão corretas" },
    correctAnswer: "d",
    explanation: "O padrão internacional é 2°C/1000ft ou aproximadamente 0.65°C/100m.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "A milha terrestre (statute mile) equivale a:",
    options: { a: "1852 m", b: "1609 m", c: "1500 m", d: "1000 m" },
    correctAnswer: "b",
    explanation: "1 statute mile = 1.609 meters.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "Sinal de luz verde contínua vindo da torre de controle para aeronave em voo significa:",
    options: { a: "Livre pouso", b: "Regresse para pouso", c: "Dê passagem a outras aeronaves", d: "Aeródromo perigoso" },
    correctAnswer: "a",
    explanation: "Luz verde contínua no ar = Livre pouso.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "O sistema elétrico da maioria das aeronaves leves opera em:",
    options: { a: "12V ou 24V DC", b: "110V AC", c: "220V AC", d: "5V DC" },
    correctAnswer: "a",
    explanation: "Aeronaves pequenas usam baterias de chumbo-ácido ou níquel-cádmio de 12V ou 24V.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "O teto absoluto é a altitude onde a razão de subida máxima é:",
    options: { a: "100 pés/min", b: "0 pés/min", c: "500 pés/min", d: "Indefinida" },
    correctAnswer: "b",
    explanation: "No teto absoluto, o avião não consegue mais subir (ROC = 0). O teto de serviço é onde ROC = 100ft/min.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "A função do radiador de óleo é:",
    options: { a: "Aquecer o motor mais rápido", b: "Dissipar o calor absorvido pelo óleo", c: "Filtrar impurezas", d: "Aumentar a pressão do óleo" },
    correctAnswer: "b",
    explanation: "O óleo retira calor das partes internas; o radiador troca esse calor com o fluxo de ar externo.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Emergências",
    statement: "Qual é o significado de 'WILCO' na fraseologia de rádio?",
    options: { a: "Entendido", b: "Ciente e cumprirei", c: "Repita a mensagem", d: "Afirmativo" },
    correctAnswer: "b",
    explanation: "WILCO = Will Comply.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "O fator de carga (load factor) aumenta significativamente em:",
    options: { a: "Voo de cruzeiro", b: "Curvas acentuadas", c: "Descidas rápidas", d: "Decolagens curtas" },
    correctAnswer: "b",
    explanation: "Em uma curva, a sustentação deve equilibrar o peso e a força centrífuga, aumentando a carga nas asas.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "Orvalho e geada são exemplos de:",
    options: { a: "Precipitação", b: "Deposição/Hidrometeoros de superfície", c: "Condensação em altitude", d: "Sublimação reversa" },
    correctAnswer: "b",
    explanation: "Ocorrem por contato do ar úmido com superfícies frias, não 'caem' da nuvem.",
    difficulty: "hard",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "O GPS utiliza qual sistema de coordenadas para determinar a posição?",
    options: { a: "Loxodromia", b: "WGS-84", c: "Ortodromia", d: "Lambert" },
    correctAnswer: "b",
    explanation: "World Geodetic System 1984 é o datum padrão do GPS.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "Qual a distância aproximada de um grau de latitude?",
    options: { a: "1 NM", b: "60 NM", c: "111 km", d: "As duas últimas estão corretas" },
    correctAnswer: "d",
    explanation: "1° de latitude = 60 NM, que dá aproximadamente 111 km.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "A corrida de decolagem é menor quando:",
    options: { a: "Ha vento de cauda", b: "Ha vento de proa", c: "O ar é menos denso", d: "A pista é em declive" },
    correctAnswer: "b",
    explanation: "Vento de proa reduz a velocidade de solo necessária para atingir a velocidade de decolagem relativa ao ar.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Conhecimentos Técnicos",
    statement: "A cor do combustível AVGAS 100LL é:",
    options: { a: "Verde", b: "Azul", c: "Vermelha", d: "Transparente" },
    correctAnswer: "b",
    explanation: "80 (Vermelho), 100 (Verde), 100LL (Azul), Jet-A1 (Transparente/Palha).",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Meteorologia",
    statement: "Um vento de 270° sopra do:",
    options: { a: "Norte", b: "Leste", c: "Oeste", d: "Sul" },
    correctAnswer: "c",
    explanation: "A direção do vento é de onde ele vem. 270° é Oeste.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Segurança de Voo",
    statement: "O que significa ALPA?",
    options: { a: "Air Line Pilots Association", b: "Aviation Loss Prevention Agency", c: "Altitude Low Power Alert", d: "Nenhuma das anteriores" },
    correctAnswer: "a",
    explanation: "É uma das maiores associações de pilotos do mundo focada em segurança e direitos.",
    difficulty: "medium",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Regulamentos de Tráfego Aéreo",
    statement: "O nível de voo FL075 é:",
    options: { a: "750 pés", b: "7500 pés", c: "75.000 pés", d: "Altitude de transição" },
    correctAnswer: "b",
    explanation: "Flight Level é a altitude em centenas de pés com pressão padrão 1013.2 hPa.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Teoria de Voo",
    statement: "Um avião com asas altas e diedro positivo tende a ser mais estável:",
    options: { a: "Lateralmente", b: "Longitudinalmente", c: "Direcionalmente", d: "Somente no solo" },
    correctAnswer: "a",
    explanation: "Diedro e efeito quilha (asa alta) contribuem para a estabilidade lateral (roll).",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Motores",
    statement: "A ignição precoce do combustível devido a pontos quentes na câmara de combustão chama-se:",
    options: { a: "Detonação", b: "Pré-ignição", c: "Flashpoint", d: "Blowback" },
    correctAnswer: "b",
    explanation: "Pré-ignição ocorre antes da faísca da vela, geralmente por depósitos de carvão incandescentes.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  },
  {
    subject: "Navegação Aérea",
    statement: "O instrumento que indica a proa da aeronave através de um giroscópio é o:",
    options: { a: "Bússola magnética", b: "Giro Direcional", c: "ADF", d: "VOR" },
    correctAnswer: "b",
    explanation: "O giro direcional é mais preciso que a bússola por não sofrer oscilações magnéticas em curvas e acelerações.",
    difficulty: "easy",
    isPremium: false,
    isActive: true
  },
  {
    subject: "Performance",
    statement: "O peso máximo de decolagem é limitado por:",
    options: { a: "Estrutura da aeronave", b: "Comprimento da pista", c: "Obstáculos na subida", d: "Todas as anteriores" },
    correctAnswer: "d",
    explanation: "Vários fatores operacionais e estruturais limitam o peso seguro para cada voo.",
    difficulty: "medium",
    isPremium: true,
    isActive: true
  }
];

export async function seedQuestions() {
  const questionsCol = collection(db, "questions");
  // Use a query to check for questions, but we might want to overwrite or add to them.
  // For this applet, let's facilitate adding if we have a larger list.
  const snapshot = await getDocs(query(questionsCol, limit(1)));
  
  if (snapshot.size < 50) { // If we have fewer than 50 questions, let's seed the full list.
    console.log("Seeding / Updating questions bank...");
    await Promise.all(questions.map(q => 
      addDoc(questionsCol, {
        ...q,
        createdAt: new Date().toISOString()
      })
    ));
    console.log("Seeding complete!");
  } else {
    console.log("Question bank already populated, skipping seed.");
  }
}
