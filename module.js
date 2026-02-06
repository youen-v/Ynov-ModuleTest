/**
 * Calcule de l'age d'une personne à partir de sa date de naissance.
 *
 * @param {object} p - Un objet représente une personne, avec une propriété 'birth' qui est un objet Date de sa date de naissance.
 * @returns {number} - L'âge de la personne en années.
 */

function calculateAge(p) {
  let dateDiff = new Date(Date.now() - p.birth.getTime());
  let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
  return age;
}
