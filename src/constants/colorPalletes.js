const yellowPalette = {
    title:"Amarillo amarrillo el platano",
    description:"",
    colors:{

        colorPrimary: "#F4B400",
        darkColorPrimary: "#C49000",
        ligthColorPrimary: "#FFE082",
        colorPrimaryHover: "#E2A700",
        colorPrimaryBg: "#FFF8E1",
        colorSuccess: "#34A853",
        colorDanger: "#E85D5D"
    }
};
const bluePalette = {
    title:"Blue label",
    description:'',
    colors:{

        colorPrimary: "#4285F4",
        darkColorPrimary: "#1A56DB",
        ligthColorPrimary: "#AECBFA",
        colorPrimaryHover: "#3367D6",
        colorPrimaryBg: "#E8F0FE",
        colorSuccess: "#34A853",
        colorDanger: "#EA4335"
    }
};
const greenPalette = {
    title:"Verdecito",
    description:'',
    colors:{

        colorPrimary: "#34A853",
        darkColorPrimary: "#0F7B3A",
        ligthColorPrimary: "#A8DAB5",
        colorPrimaryHover: "#2E9E5B",
        colorPrimaryBg: "#E6F4EA",
        colorSuccess: "#34A853",
        colorDanger: "#E5533D"
    }
};
const purplePalette = {
    title:'Morado uwu',
    description:'',
    colors:{
        colorPrimary: "#8E24AA",
        darkColorPrimary: "#5E1780",
        ligthColorPrimary: "#D1A7E3",
        colorPrimaryHover: "#7B1FA2",
        colorPrimaryBg: "#F3E5F5",
        colorSuccess: "#34A853",
        colorDanger: "#E53935"
    }
};

const orangePalette = {
    title:'Naranjita',
    description:'',
    colors:{

        colorPrimary: "#FB8C00",
        darkColorPrimary: "#EF6C00",
        ligthColorPrimary: "#FFD180",
        colorPrimaryHover: "#F57C00",
        colorPrimaryBg: "#FFF3E0",
        colorSuccess: "#34A853",
        colorDanger: "#E64A19"
    }
};
const colorPalettes = {
    default: {
    title: "Paleta Actual",
    description: "Paleta base de la aplicación, usada como configuración inicial y referencia visual.",
        colors: {
            colorPrimary: "#E85D5D",
            darkColorPrimary: "#c0392b",
            ligthColorPrimary: "#f7956a",
            colorPrimaryHover: "#d94848",
            colorPrimaryBg: "#fdf0f0",
            colorSuccess: "#34a853",
            colorDanger: "#E85D5D"
        }
  },
  bluePalette:bluePalette,
  yellowPalette:yellowPalette,
  greenPalette:greenPalette,
  purplePalette:purplePalette,
  orangePallete:orangePalette
};

const darkTheme = {
  colorBg: "#121212",
  colorSurface: "#1A1A1A",
  colorSurface2: "#202020",
  colorSurface3: "#2A2A2A",

  colorText: "#F5F4F2",
  colorDescription: "#C9C7C3",
  colorTextMuted: "#9A9690",

  colorBorder: "#2E2E2E",
  colorBorderStrong: "#3A3A3A",

  
  shadowCard: "0 1px 2px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.5)"
};
const lightTheme = {
  /* Surface */
  colorBg: "#f5f4f2",
  colorSurface: "#ffffff",
  colorSurface2: "#f2f1ef",
  colorSurface3: "#e9e8e6",

  /* Text */
  colorText: "#1a1917",
  colorDescription: "#51504f",
  colorTextMuted: "#8a8680",

  /* Borders */
  colorBorder: "#eae9e6",
  colorBorderStrong: "#c8c7c3",

  /* Shadows */
  shadowCard: "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)"
};
class AppColorPallete {

  constructor() {
    const currentPalleteKey = this.getCurrentPallete();
    const currentTheme = this.getCurrentTheme();

    this.applyColorPalette(
      currentPalleteKey === null ? "default" : currentPalleteKey
    );

    this.applyTheme(
      currentTheme === null ? "light" : currentTheme
    );
  }


  applyColorPalette(key) {
    const colors = colorPalettes[key]?.colors;
    if (!colors) return;

    this.#applyCssVariables(colors);
    this.#savePaletteOnLocalStorage(key);
  }

  getPalletesKeys() {
    return Object.keys(colorPalettes).map((key) => ({
      key,
      preview: colorPalettes[key].colors.colorPrimary,
      title: colorPalettes[key].title,
      colors: colorPalettes[key].colors
    }));
  }

  getCurrentPallete() {
    const currentPallete = localStorage.getItem("color-pallete-key");
    if (!colorPalettes[currentPallete]) {
      return "default";
    }
    return currentPallete;
  }

  #savePaletteOnLocalStorage(key) {
    localStorage.setItem("color-pallete-key", key);
  }


  applyTheme(mode) {
    const theme = mode === "dark" ? darkTheme : lightTheme;

    this.#applyCssVariables(theme);
    this.#saveThemeOnLocalStorage(mode);
  }

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    this.applyTheme(nextTheme);
  }

  getCurrentTheme() {
    return localStorage.getItem("app-theme");
  }

  #saveThemeOnLocalStorage(mode) {
    localStorage.setItem("app-theme", mode);
  }

 

  #applyCssVariables(variables) {
    const root = document.documentElement;

    Object.entries(variables).forEach(([key, value]) => {
      const cssVariableName =
        "--" + key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

      root.style.setProperty(cssVariableName, value);
    });
  }
}

const appColorPallete = new AppColorPallete();
export default appColorPallete;