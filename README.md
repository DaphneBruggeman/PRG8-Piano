# 🎹 Virtual Piano with Handpose

De *Virtual Piano with Handpose* is een webapplicatie waarmee je een piano kunt bespelen met alleen je handgebaren. Door gebruik te maken van je webcam en een handpose-model, kun je verschillende pianotoetsen activeren zonder fysiek contact. Deze applicatie is ontwikkeld als één van de twee opdrachten voor het vak **Programmeren 8**.

https://stud.hosted.hr.nl/0986809/piano/

##  Inhoud

- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [Technologieën](#technologieën)
- [Mogelijke problemen](#mogelijke-problemen)

---

## Installatie

Volg deze stappen om het project lokaal op te zetten:

1. Clone of download deze repository:
   ```bash
   git clone https://github.com/DaphneBruggeman/PRG8-Piano.git
   cd PRG8-Piano/piano
2. Installeer de benodigde pakketten:
   ```bash
    npm install
3. Start het project via een lokale server (bijvoorbeeld met Live Server of een andere dev-server).

## Gebruik
Start je webcam en zorg dat je hand zichtbaar is in beeld.

De applicatie herkent je hand en handposes.

Elke handpose kan gekoppeld worden aan een pianotoets.

Je kunt je eigen data trainen en opslaan als .json bestand.

Deze data kun je uploaden om je model opnieuw te gebruiken en te evalueren.

Na het trainen wordt een accuratie en confusion matrix weergegeven.

## Technologieën
In dit project zijn de volgende technologieën gebruikt:

JavaScript

HTML & CSS

Knear – voor machine learning op basis van KNN

Webcam + Handpose-model (TensorFlow.js / MediaPipe) (afhankelijk van implementatie)

JSON – voor opslag en gebruik van trainingsdata

## Mogelijke problemen
Webcam werkt niet: Zorg ervoor dat je browser toestemming heeft om de webcam te gebruiken.

CORS-fouten: Gebruik een lokale server om het project correct te laten draaien (bijv. via Live Server in VS Code).

Model laadt niet / geen herkenning: Zorg dat je hand duidelijk zichtbaar is en probeer te trainen met consistente poses.
