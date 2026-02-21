export const toNepali = (number) => {
    const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(number).split('').map(digit => nepaliNumerals[parseInt(digit, 10)]).join('');
};
