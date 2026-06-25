const EventLog = require('../models/EventLog');

/**
 * Registra un evento de auditoría en la base de datos de forma asíncrona y segura.
 * @param {string} userId ID del usuario que realizó la acción
 * @param {string} action Tipo de acción (ej: 'Creación de Producto', 'Registro de Venta')
 * @param {string} details Detalles descriptivos de la acción realizada
 */
const logEvent = async (userId, action, details) => {
  try {
    if (!userId) {
      console.warn('Advertencia: Intento de registrar evento sin userId.');
      return;
    }
    const log = new EventLog({
      user: userId,
      action,
      details
    });
    await log.save();
  } catch (error) {
    // Capturamos el error para que un fallo en la auditoría no rompa el flujo principal
    console.error('Error al registrar evento de auditoría:', error.message);
  }
};

module.exports = { logEvent };
