// Guion del usuario. Cada nodo es una frase y un Enter.
export const streetDialogue={
 greeting:{speaker:'TÚ',text:'ya me tengo que ir, se hizo muy tarde',next:'stay'},
 stay:{speaker:'NINA',text:'no puedo ir a tu casa contigo?',next:'quiet'},
 quiet:{speaker:'TÚ',text:'ya pero.. no hagas mucha bulla',next:null}
};
export const windowDialogue={
 greeting:{speaker:'TÚ',text:'ya es muy tarde, no te iras a tu casa?',next:'unsure'},
 unsure:{speaker:'NINA',text:'no se...',next:'permission'},
 permission:{speaker:'NINA',text:'puedo pedir permiso a mi mamá',next:'tonight'},
 tonight:{speaker:'NINA',text:'para quedarme esta noche',next:'first'},
 first:{speaker:'TÚ',text:'seria nuestra primera noche',next:'together'},
 together:{speaker:'TÚ',text:'juntos...',next:'yesTogether'},
 yesTogether:{speaker:'NINA',text:'juntos',next:null}
};
