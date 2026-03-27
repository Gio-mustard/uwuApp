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


class AppColorPallete{

    constructor(){
        const currentPalleteKey = this.getCurrentPallete();
        
        this.applyColorPalette(currentPalleteKey === null ? 'default':currentPalleteKey);
        

    }

    applyColorPalette(key) {
        const colors = colorPalettes[key].colors;
        if (colors === undefined) return;
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
            const cssVariableName = `--${key
                .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
                
                root.style.setProperty(cssVariableName, value);
            });
            this.#saveOnLocalStorage(key);
        }

    getPalletesKeys(){
        return Object.keys(colorPalettes).map((key)=>(
            {
                key:key,
                preview:colorPalettes[key].colors.colorPrimary,
                title:colorPalettes[key].title
            }
        ));

    }

    getCurrentPallete(){
        const currentPallete = localStorage.getItem('color-pallete-key');
        if (!(currentPallete in this.getPalletesKeys())) {
            this.applyColorPalette('default');
            return 'default';
        }
        return currentPallete;
    }

    #saveOnLocalStorage(key){
        localStorage.setItem('color-pallete-key',key);
    }
}
const appColorPallete = new AppColorPallete();
export default appColorPallete;