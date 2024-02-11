db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    {
      role: 'readWrite',
      db: 'migadeoro',
    },
  ],
})

db = db.getSiblingDB('migadeoro')

db.createCollection('order')

db.order.insertMany([
  {
    _id: ObjectId('6536518de9b0d305f193b5ef'),
    idUser: 1,
    client: {
      fullName: 'Juan Perez',
      email: 'juanperez@gmail.com',
      telephone: '+34123456789',
      address: {
        street: 'Calle Mayor',
        number: '10',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        postCode: '28001',
      },
    },
    orderLine: [
      {
        idProduct: 'f1c3f5a4-bebd-4619-b136-ba2bcfbd5c9a',
        priceProduct: 2.5,
        stock: 1,
        total: 2.5,
      },
      {
        idProduct: '8f1849c9-8885-4b3f-bd82-d919d585ce04',
        priceProduct: 3,
        stock: 1,
        total: 3,
      },
    ],
    createdAt: '2023-10-23T12:57:17.3411925',
    updatedAt: '2023-10-23T12:57:17.3411925',
    isDeleted: false,
    totalItems: 2,
    total: 5.5,
  },
])