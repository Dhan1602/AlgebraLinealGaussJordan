var formTamanio = document.querySelector("#formTamanio");
let tamanioMatriz = {
    filas: 0,
    columnas: 0
}

formTamanio.addEventListener("submit", e => {
    e.preventDefault();
    tamanioMatriz.filas = parseInt(formTamanio.uno.value);
    tamanioMatriz.columnas = parseInt(formTamanio.dos.value) + 1;
    generarMatriz(tamanioMatriz.filas, tamanioMatriz.columnas);
})

function generarMatriz(filas, columnas) {
    const matrizDiv = document.getElementById("matriz");
    matrizDiv.innerHTML = '<p>Ingrese los valores de las ' + tamanioMatriz.filas + ' ecuaciones </p>'; // Limpia la matriz anterior si la hubiera

    const gridContainer = document.createElement("div");
    gridContainer.classList.add("grid-container");

    // Ajusta el número de columnas dinámicamente en el grid (nombres de las variables + "=")
    gridContainer.style.gridTemplateColumns = `repeat(${columnas + 1}, 1fr)`;

    // Agregar la primera fila de encabezados: "#", "x1", "x2", ..., "="
    gridContainer.appendChild(crearCeldaEncabezado("#"));
    for (let j = 1; j < columnas; j++) {
        gridContainer.appendChild(crearCeldaEncabezado(`x${j}`));
    }
    gridContainer.appendChild(crearCeldaEncabezado("="));

    // Crear las filas de inputs
    for (let i = 0; i < filas; i++) {
        // Primera columna con el número de la fila
        gridContainer.appendChild(crearCeldaEncabezado(`${i + 1}`));
        for (let j = 0; j < columnas; j++) {
            let input = document.createElement("input");
            input.type = "text"; // Tipo de input
            input.name = `input_${i}_${j}`; // Asignar un nombre único a cada input
            input.autocomplete = "off";
            gridContainer.appendChild(input);
        }
    }

    // Agregar el contenedor del grid al div
    matrizDiv.appendChild(gridContainer);

    // Generar el botón para calcular
    const botonCalcular = document.createElement("button");
    botonCalcular.classList.add("Iniciar");
    botonCalcular.innerText = "Calcular";
    matrizDiv.appendChild(botonCalcular);
}

function crearCeldaEncabezado(texto) {
    const celda = document.createElement("div");
    celda.innerText = texto;
    return celda;
}

document.querySelector("#matriz").addEventListener("submit", e => {
    e.preventDefault();
    obtenerValores();
})

// ------------------------------------- Procedimientos --------------------------------------------------

// Determinantes
function determinante(A) {
    if (A.length === 2) {
        return A[0][0] * A[1][1] - A[0][1] * A[1][0];
    }
    let det = 0;
    for (let i = 0; i < A.length; i++) {
        let submatriz = A.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
        det += A[0][i] * determinante(submatriz) * (i % 2 === 0 ? 1 : -1);
    }
    return det;
}

// Gauss Jordan
function gaussJordan(matriz) {
    let filas = matriz.length;
    let columnas = matriz[0].length;
    let esConsistente = true;
    let tieneInfinitasSoluciones = false;

    for (let i = 0; i < filas; i++) {
        // Hacer que el pivote sea 1 dividiendo toda la fila
        let pivote = matriz[i][i];

        // Si el pivote es 0, intentar intercambiar filas
        if (pivote === 0) {
            let swapped = false;
            for (let k = i + 1; k < filas; k++) {
                if (matriz[k][i] !== 0) {
                    // Intercambiar filas
                    [matriz[i], matriz[k]] = [matriz[k], matriz[i]];
                    pivote = matriz[i][i];
                    swapped = true;
                    break;
                }
            }
            if (!swapped) {
                // Saltar esta fila si no es posible intercambiar, puede ser una fila con ceros
                continue;
            }
        }

        // Dividir la fila por el pivote para hacer que el pivote sea 1
        for (let j = 0; j < columnas; j++) {
            matriz[i][j] = matriz[i][j] / pivote;
        }

        // Hacer ceros en el resto de la columna
        for (let k = 0; k < filas; k++) {
            if (k !== i) {
                let factor = matriz[k][i];
                for (let j = 0; j < columnas; j++) {
                    matriz[k][j] = matriz[k][j] - factor * matriz[i][j];
                }
            }
        }
    }

    // Chequear consistencia del sistema
    for (let i = 0; i < filas; i++) {
        let todosCeros = true;
        for (let j = 0; j < columnas - 1; j++) { // Excluyendo la columna de resultados
            if (matriz[i][j] !== 0) {
                todosCeros = false;
                break;
            }
        }

        // Si todos los coeficientes son cero pero el término independiente no lo es
        if (todosCeros && matriz[i][columnas - 1] !== 0) {
            esConsistente = false; // Sistema inconsistente (sin solución)
            break;
        }

        // Si todos los coeficientes y el término independiente son cero
        if (todosCeros && matriz[i][columnas - 1] === 0) {
            tieneInfinitasSoluciones = true; // Podría tener infinitas soluciones
        }
    }

    // Extraer las soluciones (última columna)
    let soluciones = [];
    if (esConsistente && !tieneInfinitasSoluciones) {
        for (let i = 0; i < filas; i++) {
            let solucion = parseFloat(matriz[i][columnas - 1].toFixed(2));
            if (isNaN(solucion)) {
                esConsistente = false; // Si alguna solución es NaN, el sistema no tiene solución
                break;
            }
            soluciones.push(solucion);
        }
    }

    // Determinar el estado del sistema
    let estadoSistema = "";
    if (!esConsistente) {
        estadoSistema = "El sistema no tiene solución.";
    } else if (tieneInfinitasSoluciones) {
        estadoSistema = "El sistema tiene infinitas soluciones.";
    } else {
        estadoSistema = "El sistema tiene una única solución.";
    }

    return { "matriz": matriz, "soluciones": soluciones, "estado": estadoSistema };
}





// Factorización LU
function luFactorizacion(A) {
    let n = A.length;
    let L = Array.from({ length: n }, () => Array(n).fill(0));
    let U = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        // Triangular superior
        for (let k = i; k < n; k++) {
            let sum = 0;
            for (let j = 0; j < i; j++) {
                sum += (L[i][j] * U[j][k]);
            }
            U[i][k] = A[i][k] - sum;
        }

        // Triangular inferior
        for (let k = i; k < n; k++) {
            if (i === k) {
                L[i][i] = 1;
            } else {
                let sum = 0;
                for (let j = 0; j < i; j++) {
                    sum += (L[k][j] * U[j][i]);
                }
                L[k][i] = (A[k][i] - sum) / U[i][i];
            }
        }
    }
    return { L, U };
}

// Matriz de Cofactores
function cofactorMatrix(A) {
    const n = A.length;
    const cofactorMatrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const subMatrix = A
                .filter((_, rowIndex) => rowIndex !== i)
                .map(row => row.filter((_, colIndex) => colIndex !== j));
            const detSubMatrix = determinante(subMatrix);
            cofactorMatrix[i][j] = detSubMatrix * ((i + j) % 2 === 0 ? 1 : -1);
        }
    }

    return cofactorMatrix;
}


// Matriz Transpuesta
function transponerMatriz(A) {
    let rows = A.length;
    let cols = A[0].length;
    let T = Array.from({ length: cols }, () => Array(rows));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            T[j][i] = A[i][j];
        }
    }
    return T;
}

// Matriz Inversa
function inverseMatrix(A) {
    let n = A.length;
    let I = Array.from({ length: n }, (_, i) => Array(n).fill(0));
    for (let i = 0; i < n; i++) I[i][i] = 1;

    for (let i = 0; i < n; i++) {
        let factor = A[i][i];
        for (let j = 0; j < n; j++) {
            A[i][j] /= factor;
            I[i][j] /= factor;
        }
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = A[k][i];
                for (let j = 0; j < n; j++) {
                    A[k][j] -= factor * A[i][j];
                    I[k][j] -= factor * I[i][j];
                }
            }
        }
    }
    return I;
}


// ----------------------------------------------------------------------------------------------------

// Calculo principal

function obtenerValores() {
    let matriz = [];
    let matrizAumentada = [];
    let determinanteMatriz = 0;
    let resultadosIncognitas = {};
    let matricesLU = {};
    let matrizTranspuesta = [];
    let MatrizInversa = [];
    let matrizCofactores = [];
    let matrizAdjunta = [];

    for (let i = 0; i < tamanioMatriz.filas; i++) {
        let fila = [];
        let filaAumentada = [];
        for (let j = 0; j < tamanioMatriz.columnas; j++) {
            let valorInput = document.querySelector(`input[name="input_${i}_${j}"]`).value;
            filaAumentada.push(valorInput);
            if (j < (tamanioMatriz.columnas - 1)) {
                fila.push(valorInput);
            }
        }
        matriz.push(fila);
        matrizAumentada.push(filaAumentada);
    }

    // Llamado a los procedimientos
    determinanteMatriz = determinante(matriz);
    resultadosIncognitas = gaussJordan(matrizAumentada);
    matricesLU = luFactorizacion(matriz);
    matrizTranspuesta = transponerMatriz(matriz);
    MatrizInversa = inverseMatrix(matriz);
    matrizCofactores = cofactorMatrix(matriz);
    matrizAdjunta = transponerMatriz(matrizCofactores);
    mostrarResultados(matriz, determinanteMatriz, resultadosIncognitas, matricesLU, matrizTranspuesta, MatrizInversa)
}

// Mostrar en Interfaz de Usuario ------------------------------------------------------------------------------

function generarCards(mensaje) {
    document.querySelector("#tarjetas").innerHTML = ""
    const nuevaCard = document.createElement("div");
    nuevaCard.classList.add("card");
    nuevaCard.innerHTML = "<span>" + mensaje + "</span>"
    document.querySelector("#tarjetas").appendChild(nuevaCard)
}

function mostrarMatriz(matrix, titulo) {
    // Crear el contenedor principal
    const matrixContainer = document.createElement('div');
    matrixContainer.classList.add('matrix-container');

    // Crear y añadir el título
    const title = document.createElement('h2');
    title.innerText = titulo;
    matrixContainer.appendChild(title);

    // Crear la cuadrícula de la matriz
    const matrixGrid = document.createElement('div');
    matrixGrid.classList.add('matrix');

    // Ajustar el número de columnas dinámicamente según el tamaño de la matriz
    matrixGrid.style.gridTemplateColumns = `repeat(${matrix[0].length}, 50px)`;

    // Rellenar la cuadrícula con celdas según la matriz
    matrix.forEach(row => {
        row.forEach(cellValue => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.backgroundColor = '#3D3D3D'; // Color de celda activa
            matrixGrid.appendChild(cell);
            cell.innerHTML = Number.parseFloat(cellValue).toFixed(2)
        });
    });

    // Añadir la cuadrícula al contenedor principal
    matrixContainer.appendChild(matrixGrid);
    document.querySelector("#tarjetas").appendChild(matrixContainer); // Añadir todo al body
}

function mostrarResultados(matriz, determinanteMatriz, resultadosIncognitas, matricesLU, matrizTranspuesta, MatrizInversa, matrizCofactores, matrizAdjunta) {
    generarCards(resultadosIncognitas.estado);
    generarCards("Determinante = " + determinanteMatriz);
    console.log("Gauss Jordan: ");
    console.log(resultadosIncognitas.matriz);

    for (let i = 0; i < resultadosIncognitas.soluciones.length; i++) {
        generarCards("x" + i + " = " + resultadosIncognitas.soluciones[i]);

    }

    console.log("Matriz L");
    console.log(matricesLU.L);
    mostrarMatriz(matricesLU.L, "Matriz L")
    console.log("Matriz U");
    console.log(matricesLU.U);
    mostrarMatriz(matricesLU.U, "Matriz U")


    console.log("Matriz Transpuesta:");
    console.log(matrizTranspuesta);
    mostrarMatriz(matrizTranspuesta, "Matriz Transpuesta")

    console.log("Matriz Inversa:");
    console.log(MatrizInversa);
    mostrarMatriz(MatrizInversa, "Matriz Inversa")

    // console.log("Matriz Cofactores:");
    // console.log(matrizCofactores);

    // console.log("Matriz Adjunta:");
    // console.log(matrizAdjunta);
}