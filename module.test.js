import { calculateAge } from "./module.js";
/**
 * @function calculateAge
 */

describe("calculateAge", () => {
  it("should return the correct age for a given birth date", () => {
    const moi = {
      birth: new Date("1998-05-05"),
    };
    expect(calculateAge(moi)).toEqual(27);
  });
});
