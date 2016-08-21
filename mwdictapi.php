<?php

    $vid = "8d3c1550-6d45-4b66-adb9-c6772066a68c";
    $word = $_GET['word'];

    $request_url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/$word?key=$vid";

    echo file_get_contents($request_url);

?>
