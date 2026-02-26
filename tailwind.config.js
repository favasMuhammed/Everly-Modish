/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html"],
    safelist: [
        {
            pattern: /(bg|text|border|hover:border)-(indigo|emerald|cyan|blue|violet|rose|orange|amber|slate)-(50|200|600)/,
        }
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
