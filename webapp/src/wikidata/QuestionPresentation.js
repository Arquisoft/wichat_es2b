import QuestionGeneration from './QuestionGeneration.js';

class QuestionPresentation {
    constructor(container, navigate) {
        this.container = container;
        this.navigate = navigate; // Guarda la función de navegación
        this.game = new QuestionGeneration(this);
        this.createBaseLayout();
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.rounds = 0;
        this.maxRounds = 10;
        this.game.fetchQuestions();
    }

    //Se crea la base del proyecto
    createBaseLayout() {
        this.container.innerHTML = `
            <div id="quiz-container">
                <h1>Adivina la Ciudad 🌍</h1>
                <img id="city-image" src="" alt="Imagen de ciudad">
                <div id="options"></div>
                <p id="result"></p>
                <p id="score"></p>
            </div>
        `;
    }

    //Carga las preguntas y las imagenes a la pantalla
    renderQuestion(answers, correct) {
        const cityImage = document.getElementById("city-image");
        const optionsDiv = document.getElementById("options");

                cityImage.src = answers[correct];
        optionsDiv.innerHTML = "";

        Object.keys(answers).forEach(city => {
            let btn = document.createElement("button");
            btn.innerText = city;
            btn.classList.add("option");
            
            // Evento de clic con desactivación de botones al seleccionar respuesta
            btn.onclick = () => {
                this.disableButtons(); // Desactivar botones
                this.game.checkAnswer(city, correct);
            };

            optionsDiv.appendChild(btn);
        });
    }

    //Te muestra si es correcto o incorrecto segun el resultado
    showResult(isCorrect) {
        if (isCorrect) {
            this.correctAnswers++;
            document.getElementById("result").innerText = "¡Correcto! ✅";
        } else {
            this.incorrectAnswers++;
            document.getElementById("result").innerText = "Incorrecto ❌";
        }

        this.rounds++;

        if (this.rounds < this.maxRounds) {
            setTimeout(() => {
                this.game.fetchQuestions();
            }, 3000); // Ajusta el tiempo de espera a 3 segundos
        } else {
            this.showFinalScore();
        }
    }

    //Funcion desabilitar botones
    disableButtons() {
        document.querySelectorAll(".option").forEach(btn => {
            btn.disabled = true;
        });
    }

    //Resultado final de respuestas correctas, erroneas y un ratio
    showFinalScore() {
        this.container.innerHTML = `
            <h1>Resultados Finales</h1>
            <p>Respuestas correctas: ${this.correctAnswers}</p>
            <p>Respuestas incorrectas: ${this.incorrectAnswers}</p>
            <p>Ratio: ${Math.round((this.correctAnswers/(this.incorrectAnswers+this.correctAnswers))*100)}%</p>
            <button id="menu-button">Volver al menú principal</button>
        `;

        // Añade un evento de clic al botón para redirigir al usuario al menú
        document.getElementById("menu-button").onclick = () => {
            this.navigate('/menu');
        };
    }
}

export default QuestionPresentation;


document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('app'); // Asegúrate de que exista en tu HTML

    const navigate = (path) => {
        console.log(`Navegando a: ${path}`);
        // Aquí puedes agregar lógica de navegación real si usas un router
    };

    new QuestionPresentation(container, navigate);
});
