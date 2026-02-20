import { calculateAge } from "../src/validators/module.js";
import {
  validateAdult,
  validatePostalCode,
  validateIdentity,
  validateEmail,
} from "../src/validators/validator.js";

let people20years;
beforeEach(() => {
  let date = new Date();
  people20years = {
    birth: new Date(date.setFullYear(date.getFullYear() - 20)),
  };
});

/**
 * @function calculateAge
 */

describe("calculateAge", () => {
  it("should return the correct age for a given birth date", () => {
    expect(calculateAge(people20years)).toEqual(20);
  });

  it("check la propriétée birth est présente", () => {
    const payload = { date: "2000-01-01" };
    expect(Object.prototype.hasOwnProperty.call(payload, "birth")).toBe(false);
  });

  it("n'a pas de parametre", () => {
    expect(() => calculateAge()).toThrow("Missing parameter p");
  });

  it("throw si < 18", () => {
    const p = {
      birth: new Date(new Date().setFullYear(new Date().getFullYear() - 17)),
    };
    expect(() => validateAdult(p)).toThrow("Pegi 18");
  });

  it("ok si >= 18", () => {
    const p = {
      birth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)),
    };
    expect(validateAdult(p)).toEqual(20);
  });

  it("throw si le parametre n'est pas un object", () => {
    const invalidInput = [undefined, null, 42, "test", true, () => {}, []];

    for (const input of invalidInput) {
      expect(() => calculateAge(input)).toThrow();
    }
  });

  it("throw si la propriétée birth n'est pas une date", () => {
    const invalidBirth = [
      { birth: 123 },
      { birth: "abc" },
      { birth: "" },
      { birth: null },
      { birth: "12/99/9999" },
      { birth: "2026-13-01" },
    ];

    for (const birth of invalidBirth) {
      expect(() => calculateAge(birth)).toThrow();
    }
  });

  test("throw si birth est une date est incorrect", () => {
    const invalidDate = [
      { birth: "2026-02-31" },
      { birth: "2025-04-31" },
      { birth: "2025-02-29" },
    ];

    for (const date of invalidDate) {
      expect(() => calculateAge(date)).toThrow();
    }
  });
});

describe("validatePostalCode", () => {
  it("ok si 5 chiffres exacts", () => {
    expect(validatePostalCode("75001")).toHaveLength(5);
  });

  it("erreur si null/undefined/empty", () => {
    expect(() => validatePostalCode(null)).toThrow("Zip required");
    expect(() => validatePostalCode(undefined)).toThrow("Zip required");
    expect(() => validatePostalCode("")).toThrow("Zip required");
  });

  it("erreur si format invalide", () => {
    expect(() => validatePostalCode("7500")).toThrow("Zip code wrong length");
    expect(() => validatePostalCode("750001")).toThrow("Zip code wrong length");
    expect(() => validatePostalCode("75A01")).toThrow("Zip code wrong length");
    expect(() => validatePostalCode(" 75001")).toThrow("Zip code wrong length");
    expect(() => validatePostalCode(75001)).toThrow("Zip code type error");
  });
});

describe("validateIdentity", () => {
  it("ok avec accents et tirets", () => {
    expect(
      validateIdentity({ firstName: "Jean-Émile", lastName: "Dùpont" }),
    ).toEqual({ firstName: "Jean-Émile", lastName: "Dùpont" });
  });

  it("erreur si null/undefined/objet vide", () => {
    expect(() => validateIdentity(null)).toThrow("Identity is required");
    expect(() => validateIdentity(undefined)).toThrow("Identity is required");
    expect(() => validateIdentity({})).toThrow("firstName are required");
  });

  it("erreur si champs manquants", () => {
    expect(() => validateIdentity({ firstName: "Jean" })).toThrow(
      "lastName are required",
    );
    expect(() => validateIdentity({ lastName: "Dupont" })).toThrow(
      "firstName are required",
    );
  });

  it("erreur si chiffres ou caractères spéciaux", () => {
    expect(() =>
      validateIdentity({ firstName: "Jean2", lastName: "Dupont" }),
    ).toThrow("Invalid identity format");
    expect(() =>
      validateIdentity({ firstName: "Jean", lastName: "Du!pont" }),
    ).toThrow("Invalid identity format");
  });

  it("protection XSS simple : refuse balises html", () => {
    expect(() =>
      validateIdentity({
        firstName: "<script>alert(1)</script>",
        lastName: "Dupont",
      }).toThrow("HTML tags are not allowed in identity"),
    );
    expect(() =>
      validateIdentity({ firstName: "Jean", lastName: "<b>Dupont</b>" }),
    ).toThrow("HTML tags are not allowed in identity");
  });

  it("throw si identity n’est pas un objet", () => {
    expect(() => validateIdentity("test")).toThrow(
      "Identity must be an object",
    );
    expect(() => validateIdentity(42)).toThrow("Identity must be an object");
    expect(() => validateIdentity(true)).toThrow("Identity must be an object");
    expect(() => validateIdentity(["firstname lastname"])).toThrow(
      "Identity must be an object",
    );
  });

  it("si firstName ou lastName n’est pas une string", () => {
    expect(() =>
      validateIdentity({ firstName: 123, lastName: "Dupont" }),
    ).toThrow("firstName/lastName must be strings");

    expect(() =>
      validateIdentity({ firstName: "Jean", lastName: 456 }),
    ).toThrow("firstName/lastName must be strings");

    expect(() =>
      validateIdentity({ firstName: null, lastName: "Dupont" }),
    ).toThrow("firstName are required");
  });
});

describe("validateEmail", () => {
  it("ok email standard", () => {
    expect(validateEmail("john.doe+it@mail.com")).toEqual(
      "john.doe+it@mail.com",
    );
  });

  it("erreur si null/undefined/empty", () => {
    expect(() => validateEmail(null)).toThrow("Email is required");
    expect(() => validateEmail(undefined)).toThrow("Email is required");
    expect(() => validateEmail("")).toThrow("Email is required");
  });

  it("erreur si type invalide", () => {
    expect(() => validateEmail(123)).toThrow("Email must be a string");
    expect(() => validateEmail({})).toThrow("Email must be a string");
  });

  it("erreur format invalide", () => {
    expect(() => validateEmail("john@")).toThrow("Invalid email format");
    expect(() => validateEmail("@mail.com")).toThrow("Invalid email format");
    expect(() => validateEmail("john@mail")).toThrow("Invalid email format");
    expect(() => validateEmail("john mail@mail.com")).toThrow(
      "Invalid email format",
    );
  });
});
