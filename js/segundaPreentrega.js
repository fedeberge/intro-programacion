
//divs con elementos a mover:
let contenedor = document.getElementById("contenedor");
let prota = document.getElementById("prota");
let menu = document.getElementById("menu");
let coleccion = document.getElementById("coleccion");
let cursor = document.getElementById("cursor");
let fondoNormal=true;
//cambiar el fondo con el boton:
let cambiaFondo = document.getElementById("cambiar-fondo");
cambiaFondo.addEventListener("click", () => {
    if(fondoNormal) {
        contenedor.style.background = "url('../img/escenario-debug.png') top center";
        fondoNormal = false;
    } else {
        contenedor.style.background = "url('../img/escenario.png') top center";        
        fondoNormal = true;
    }
    contenedor.style.backgroundSize = "100%";
})
//orientación es hacia donde mira el personaje. 
//Norte Sur Este Oeste. 
//Empieza mirando hacia el sur.
let orientacion = "S";

//el menu y la coleccion inicializan cerrados y la posicion del cursor en 0:
let menuAbierto = false;
let cursorMenu = 0;
let pantallaColeccion = false;

//para animar el personaje segun la orientacion uso una imagen ancha 
//controlada con una variable css. 
//basicamente en una misma imagen está la animacion del personaje desde cada vista
//orientacion - numero de frame
//n-1|n-2|e-1|e-2|s-1|s-2|o-1|o-2
//hay una animación css que va desde n-1 a n-2 y vuelve, para tener frame1/frame2/frame1/frame2 en loop
//segun la orientación esa animacion se desplaza más a la derecha para mostrar s-1/s-2 y asi
let animacion = document.body.style;

//las coordenadas iniciales del personaje, en la puerta de la carpa
let posX = 2 * (16 * 4);
let posY = 4 * (16 * 4);

//esto debería cambiar en moverFondo() para que el fondo scrollee para arriba 
//en vez de que el personaje alcance el borde del contenedor
let offsetFondo = 0;

//Setear el inicio del personaje y del fondo
prota.style.top = posY + "px";
prota.style.left = posX + "px";
contenedor.style.backgroundPositionY = offsetFondo + "px";

//había conseguido hacer que funcione, pero despues modifiqué la funcion de animar y se rompio
function moverFondo(y) {
    if (y >= 256) {
        offsetFondo -= 64
    };
    if (offsetFondo < -128) {
        offsetFondo = -128
    } else if (y < 256 && offsetFondo < 0) {
        offsetFondo += 64;
    }
    console.log("debería moverse el fondo desde " + contenedor.style.backgroundPositionY);
    contenedor.style.backgroundPositionY = offsetFondo + "px";
    console.log("hasta " + contenedor.style.backgroundPositionY);
}

//esta hace que el jugador no se pueda salir por arriba o los costados
//y llama a la que mueve el fondo para que se vea la orilla
function mantenerDentro(x, y) {
    let yAct = prota.offsetTop;

    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    if (x > 704) {
        x = 704;
    }
    if (y != yAct && offsetFondo != 0) { //vuelve el fondo a su posicion original si hay offset y si el mov es de N a S
        moverFondo(y);
        y += 64;
    }
    if (y > 256) {
        y = 256;
        moverFondo(y);
    }

    return [x, y]
}

//mueve al personaje según la direccion a caminar
function animarCaminata(deltaX, deltaY) {
    let origenX = prota.offsetLeft;
    let origenY = prota.offsetTop;

    if (origenX % 64 != 0) {
        origenX = Math.floor(origenX / 64) * 64;
    }
    if (origenY % 64 != 0) {
        origenY = Math.floor(origenY / 64) * 64;
    }

    destinoX = origenX + deltaX;
    destinoY = origenY + deltaY;

    [destinoX, destinoY] = mantenerDentro(destinoX, destinoY); //evita que el personaje se salga del contenedor
    orientarAnimacion(true);
    prota.style.left = (destinoX) + "px";
    prota.style.top = (destinoY) + "px";
    setTimeout(orientarAnimacion,500);
}

//escribir funcion orientarAnimacion() 
function orientarAnimacion(camina=false){
    let offsetAnimacion = 0;
    switch(orientacion) {
        case "N":
            offsetAnimacion = 0;
            break;
        case "E":
            offsetAnimacion = -128;
            break;
        case "S":
            offsetAnimacion = -256;
            break;
        case "O":
            offsetAnimacion = -384;
        }
    if (camina) {
        prota.style.animationDuration="0.5s";
        offsetAnimacion -= 512;
    } else {
        prota.style.animationDuration="1.5s";
    }
    animacion.setProperty("--offsetAnimacion",offsetAnimacion+"px");
};

//segun la orientacion determina hacia donde caminar
function caminar() {
    var deltaX = 0,
        deltaY = 0;
    switch (orientacion) {
        case "N":
            deltaY = -64;
            break;
        case "E":
            deltaX = 64;
            break;
        case "S":
            deltaY = 64;
            break;
        case "O":
            deltaX = -64;
            break;
    }
    animarCaminata(deltaX, deltaY); //llama para mover al personaje

}


function manejarMenu() {
    if (menuAbierto) {
        menuAbierto = false;
        menu.classList.remove("activo");
    } else {
        menuAbierto = true;
        menu.classList.add("activo");
    }
}

function manejarColeccion() {
    if (pantallaColeccion) {
        pantallaColeccion = false;
        coleccion.classList.remove("activa");

    } else {
        pantallaColeccion = true;
        coleccion.classList.add("activa");
    }
}

function moverCursor() {
    if (cursorMenu == 0) {
        cursor.style.top = "calc(10*32px)"
    } else {
        cursor.style.top = "calc(12*32px)"
    }
}

//como todas las teclas cierran la ventana de coleccion, todos los 
document.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                cursorMenu--;
                if (cursorMenu < 0) {
                    cursorMenu = 1
                };
            } else {
                if (orientacion == "N") {
                    caminar();
                } else {
                    orientacion = "N";
                    orientarAnimacion();
                }
            }
            break;
        case "ArrowRight":
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                break;
            } else {
                if (orientacion == "E") {
                    caminar();
                } else {
                    orientacion = "E";
                    orientarAnimacion();
                }
            }
            break;
        case "ArrowDown":
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                cursorMenu++;
                if (cursorMenu > 1) {
                    cursorMenu = 0
                };
            } else {
                if (orientacion == "S") {
                    caminar();
                } else {
                    orientacion = "S";
                    orientarAnimacion();
                }
            }
            break;
        case "ArrowLeft":
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                break;
            } else {
                if (orientacion == "O") {
                    caminar();
                } else {
                    orientacion = "O";
                    orientarAnimacion();
                }
            }
            break;
        case "Enter":
            if (pantallaColeccion) {
                manejarColeccion()
            } else {
                manejarMenu();
            }
            break;
        case "x": //B
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                manejarMenu();
            }
            break;
        case "z": //A
            if (pantallaColeccion) {
                manejarColeccion()
            } else if (menuAbierto) {
                if (cursorMenu == 0) {
                    manejarColeccion();
                } else if (cursorMenu == 1) {
                    manejarMenu();
                }
            }
            break;
    }
    moverCursor();
});