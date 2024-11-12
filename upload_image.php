<?php
$uploadDir = 'images/';
$response = ["success" => false, "filePath" => ""];

if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    $fileName = basename($_FILES['image']['name']);
    $targetFilePath = $uploadDir . $fileName;

    // Mover el archivo a la carpeta del servidor
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
        $response["success"] = true;
        $response["filePath"] = $targetFilePath;
    } else {
        $response["error"] = "Error al mover el archivo subido.";
    }
} else {
    $response["error"] = "No se ha subido ningún archivo o ocurrió un error.";
}

echo json_encode($response);
?>

