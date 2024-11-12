<?php
$host = "localhost";
$dbname = "alurageek";
$username = "root";
$password = "";

try {
    // Establecer la conexión a la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener los datos enviados en el cuerpo de la solicitud y el ID del producto a actualizar
    $data = json_decode(file_get_contents("php://input"), true);
    $id = isset($_GET['id']) ? $_GET['id'] : null;

    var_dump($data); // Para verificar los datos recibidos

    // Verificar que se recibieron los datos necesarios
    if ($data && $id) {
        // Comprobar si se envió una nueva imagen
        if (!empty($data['imagen'])) {
            // Si hay una imagen nueva, actualizar todos los campos
            $stmt = $conn->prepare("UPDATE productos SET nombre = :nombre, precio = :precio, imagen = :imagen WHERE id = :id");
            $stmt->bindParam(':imagen', $data['imagen']);
        } else {
            // Si no hay una imagen nueva, no actualizar el campo `imagen`
            $stmt = $conn->prepare("UPDATE productos SET nombre = :nombre, precio = :precio WHERE id = :id");
        }

        // Asignar los valores de `nombre`, `precio` y `id`
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':precio', $data['precio']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        // Ejecutar la actualización
        $stmt->execute();

        // Enviar una respuesta de éxito
        echo json_encode(["success" => true, "message" => "Producto actualizado correctamente"]);
    } else {
        // Respuesta de error si faltan datos
        echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    }
} catch (PDOException $e) {
    // Manejo de error de la base de datos
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>

