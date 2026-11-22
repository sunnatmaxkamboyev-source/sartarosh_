export const jsonOptions = {
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash; // parol hech qachon tashqariga chiqmasin
    return ret;
  },
};