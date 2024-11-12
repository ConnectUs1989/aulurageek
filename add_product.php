<?php
$host = "localhost";
$dbname = "alurageek";
$username = "root";
$password = "";

try {
    // Establecer conexión a la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener los datos enviados en el cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data && isset($data['nombre']) && isset($data['precio'])) {
        // Manejo de la imagen
        $imagePath = "images/defaultImage.png"; // Imagen predeterminada si no se carga ninguna

        if (!empty($data['imagen'])) {
            $imageData = $data['imagen'];
            $imageName = uniqid() . '.jpg'; // Nombre único para la imagen
            $imagePath = "images/" . $imageName;

            // Decodificar la imagen en Base64 y guardarla en la carpeta 'images'
            $imageContent = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
            file_put_contents($imagePath, $imageContent);
        }

        // Insertar datos en la base de datos con la ruta de la imagen
        $stmt = $conn->prepare("INSERT INTO productos (nombre, precio, imagen) VALUES (:nombre, :precio, :imagen)");
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':precio', $data['precio']);
        $stmt->bindParam(':imagen', $imagePath);
        $stmt->execute();

        // Respuesta de éxito
        echo json_encode(["success" => true, "message" => "Producto agregado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>
