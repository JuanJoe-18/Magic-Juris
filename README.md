# **MagicJuris — Sistema de Seguimiento Judicial y Atención Proactiva**

##  **El Problema**

En la firma *Hurtado Gandini Abogados S.A.S.*, cada abogado gestiona una cartera de entre 40 y 120 procesos judiciales activos. El seguimiento manual del estado procesal de cada expediente es un proceso ineficiente, costoso y de alto riesgo: el reloj procesal no se detiene (art. 295 CGP), y omitir el vencimiento de un término puede derivar en graves consecuencias de responsabilidad disciplinaria y pérdida de oportunidades legales.

##  **La Solución**

*MagicJuris* es una plataforma diseñada para resolver estos retos mediante la automatización y la inteligencia. El sistema permite:

1. *Monitoreo automatizado:* Supervisa automáticamente las actuaciones procesales de cada caso registrado.
2. *Clasificación inteligente:* Categoriza los eventos por nivel de criticidad (Crítica, Importante, Informativa), mostrando insignias 3D y contadores en tiempo real.
3. *Comunicación proactiva y diferenciada:* Traduce un mismo hecho procesal a tres lenguajes distintos, dependiendo del rol (Lenguaje claro para el Cliente, y resumen técnico-jurídico para el Abogado y la Administración).
4. *Cumplimiento legal y de seguridad:* Desarrollado bajo los lineamientos de Habeas Data (Ley 1581 de 2012) y el precedente de la SIC (Res. 58834/2023), garantizando anonimización y trazabilidad integral en las comunicaciones.

El prototipo se presenta bajo una estética *"Dark Premium"* elegante e interactiva, construida con React, Vite y Tailwind CSS, ofreciendo un panel de control (Dashboard) potente para el abogado y una Landing Page atractiva para los clientes, inspirada en la página de Hurtago Gandini Abogados S.A.S.

## **Instrucciones de Ejecución**

Para desplegar y probar el prototipo localmente, asegúrate de tener [Node.js](https://nodejs.org/) instalado y sigue estos pasos:

1. Clona o descarga este repositorio y abre una terminal en la raíz del proyecto.
2. Instala las dependencias necesarias: npm install
3. Abrir el backend y se copia el código: \venv\Scripts\python.exe -m uvicorn main:app --reload.
   Al dar enter se carga el servidor y el SMTP.
4. Abrir una nueva terminal (sin cerrar la anterior) para cargar el frontend. Se copia el código npm run dev y luego se da ENTER, lo que abrirá automáticamente el navegador predeterminado con la página de MAGIC² en donde se ingresa con cualquiera de las 3 credenciales de prueba dependiendo del usuario al que se quiera acceder.
