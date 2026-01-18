// Página de tutorial
export function Tutorial() {
  return (
    <div className="tutorial-container">
      <h1 className="tutorial-title">¿Cómo usar TodoApp?</h1>

      <section className="tutorial-section">
        <h2>🎯 Primeros pasos</h2>
        <p>
          TodoApp es una aplicación moderna de gestión de tareas que te permite crear,
          gestionar y completar tareas de manera eficiente. Puedes agregar tareas tanto
          por voz como por texto, y llevar un control completo de tu productividad.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>📝 Crear una cuenta</h2>
        <ol>
          <li>En la página de inicio, haz clic en "¿No tienes cuenta? Regístrate"</li>
          <li>Completa el formulario con:
            <ul>
              <li><strong>Nombre de usuario:</strong> Solo letras, números y guiones bajos (sin espacios)</li>
              <li><strong>Email:</strong> Tu dirección de correo electrónico válida</li>
              <li><strong>Contraseña:</strong> Mínimo 6 caracteres, sin espacios</li>
            </ul>
          </li>
          <li>Presiona "Registrarse"</li>
          <li>Serás redirigido automáticamente a "Mis tareas" después del registro</li>
        </ol>
      </section>

      <section className="tutorial-section">
        <h2>➕ Agregar tareas</h2>
        <p>TodoApp te ofrece dos formas de agregar tareas:</p>
        
        <div className="tutorial-actions">
          <div className="action-item">
            <h3>🎙️ Por Voz</h3>
            <ol>
              <li>En la página "Mis tareas", selecciona la pestaña <strong>"Por Voz"</strong></li>
              <li>Presiona el botón del <strong>micrófono</strong> (🎤)</li>
              <li>Permite el acceso al micrófono cuando el navegador te lo solicite</li>
              <li>Di tu tarea claramente, por ejemplo: "Comprar leche en el supermercado"</li>
              <li>La tarea se agregará automáticamente cuando el reconocimiento de voz la detecte</li>
              <li>Presiona el botón <strong>Detener</strong> (⏹️) cuando termines</li>
            </ol>
          </div>

          <div className="action-item">
            <h3>⌨️ Por Texto</h3>
            <ol>
              <li>En la página "Mis tareas", selecciona la pestaña <strong>"Por Texto"</strong></li>
              <li>Escribe tu tarea en el campo de texto</li>
              <li>Presiona el botón <strong>"Agregar"</strong> o presiona Enter</li>
              <li>La tarea se agregará inmediatamente a tu lista</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="tutorial-section">
        <h2>📊 Estadísticas y Filtros</h2>
        <p>En la parte superior de "Mis tareas" encontrarás:</p>
        <ul>
          <li><strong>Estadísticas:</strong> Total de tareas, completadas, pendientes y porcentaje de progreso</li>
          <li><strong>Búsqueda:</strong> Busca tareas específicas escribiendo en el campo de búsqueda</li>
          <li><strong>Filtros:</strong> Filtra por "Todas", "Pendientes" o "Completadas"</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>✅ Gestionar tus tareas</h2>
        <div className="tutorial-actions">
          <div className="action-item">
            <h3>✓ Marcar como completada</h3>
            <p>Presiona el botón de <strong>check</strong> (✓) para marcar una tarea como completada.
              El texto aparecerá tachado y se actualizará en la base de datos.</p>
          </div>

          <div className="action-item">
            <h3>↻ Desmarcar tarea</h3>
            <p>Si marcaste una tarea por error, presiona el botón <strong>X</strong> para desmarcarla
              y volverla a su estado pendiente.</p>
          </div>

          <div className="action-item">
            <h3>🗑️ Eliminar tarea</h3>
            <p>Presiona el botón de <strong>basura</strong> (🗑️) para eliminar definitivamente una tarea.
              Se te pedirá confirmación antes de borrarla.</p>
          </div>
        </div>
      </section>

      <section className="tutorial-section">
        <h2>📜 Historial de Eventos</h2>
        <p>En la barra de navegación encontrarás el icono de <strong>Historial</strong> que muestra:</p>
        <ul>
          <li>Todos los eventos relacionados con tus tareas (creadas, completadas, desmarcadas, eliminadas)</li>
          <li>Los últimos 20 eventos registrados</li>
          <li>Información clara con el tipo de evento y el texto de la tarea</li>
          <li>Tiempo relativo de cada evento ("Hace X minutos/horas/días")</li>
          <li>Opción para limpiar el historial completo</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>⚙️ Configuración de Perfil</h2>
        <p>Desde el dropdown de usuario puedes acceder a "Configuración" donde puedes:</p>
        <ul>
          <li><strong>Ver tu información:</strong> Email y nombre de usuario actual</li>
          <li><strong>Editar perfil:</strong> Presiona "Editar Perfil" para modificar:
            <ul>
              <li>Nombre de usuario (solo letras, números y guiones bajos)</li>
              <li>Contraseña (requiere contraseña actual para cambiar)</li>
            </ul>
          </li>
          <li><strong>Validación en tiempo real:</strong> El sistema te indicará si los datos son válidos antes de guardar</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>🔐 Seguridad y privacidad</h2>
        <ul>
          <li><strong>Tus tareas son privadas:</strong> Solo tú puedes ver y gestionar tus propias tareas</li>
          <li><strong>Sesiones seguras:</strong> Tu sesión se mantiene activa con tokens JWT seguros</li>
          <li><strong>Refresh automático:</strong> El sistema renueva tu token automáticamente cuando es necesario</li>
          <li><strong>Contraseñas encriptadas:</strong> Tu contraseña está protegida con encriptación segura</li>
          <li><strong>Validación de datos:</strong> El sistema valida todos los datos antes de enviarlos al servidor</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>💡 Consejos y recomendaciones</h2>
        <ul>
          <li><strong>Para voz:</strong> Habla de forma clara y a un volumen moderado, evita ruidos de fondo</li>
          <li><strong>Para texto:</strong> Usa la pestaña "Por Texto" cuando prefieras escribir rápidamente</li>
          <li><strong>Búsqueda:</strong> Usa el campo de búsqueda para encontrar tareas específicas rápidamente</li>
          <li><strong>Filtros:</strong> Usa los filtros para ver solo las tareas que necesitas en cada momento</li>
          <li><strong>Historial:</strong> Revisa tu historial de eventos para ver un registro completo de tus actividades</li>
          <li><strong>Navegadores:</strong> Funciona mejor en Chrome, Edge o Safari para reconocimiento de voz</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>❓ Solución de problemas</h2>
        <div className="faq-item">
          <h3>El micrófono no funciona</h3>
          <p>• Verifica que hayas dado permisos al navegador para usar el micrófono</p>
          <p>• Revisa que tu micrófono esté conectado y funcionando</p>
          <p>• Usa la opción "Por Texto" como alternativa</p>
          <p>• Recarga la página e intenta nuevamente</p>
        </div>

        <div className="faq-item">
          <h3>No puedo actualizar mi perfil</h3>
          <p>• Verifica que el nombre de usuario solo contenga letras, números y guiones bajos (sin espacios)</p>
          <p>• Si cambias la contraseña, asegúrate de ingresar la contraseña actual correctamente</p>
          <p>• Revisa los mensajes de error que aparecen para más detalles</p>
        </div>

        <div className="faq-item">
          <h3>Mi sesión expiró</h3>
          <p>• El sistema intentará renovar tu sesión automáticamente</p>
          <p>• Si es necesario, simplemente vuelve a iniciar sesión</p>
          <p>• Tus tareas están guardadas y las verás al ingresar nuevamente</p>
        </div>
      </section>

      <section className="tutorial-section cta-section">
        <h2>🚀 ¡Comienza ahora!</h2>
        <p>
          Ya estás listo para usar TodoApp. Dirígete a <strong>Mis tareas</strong> y
          comienza a crear tu primera tarea. ¡Puedes hacerlo por voz o por texto, tú decides!
        </p>
      </section>
    </div>
  );
}
