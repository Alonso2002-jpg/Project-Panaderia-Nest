// Creamos el usuario administrador de la base de datos
// con sus daatos de conexion y los roles que tendra
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

// Nos conectamos a la base de datos world
db = db.getSiblingDB('migadeoro')

// Creamos la coleccion city
db.createCollection('orders')
