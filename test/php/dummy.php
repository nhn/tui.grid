<?php
header('Access-Control-Allow-Origin: *');
$size = $_REQUEST['size'] ?  $_REQUEST['size'] : 100;
$columnModel = json_decode(stripcslashes(urldecode($_REQUEST['columnModel'])), true);

$data = array();
function getRow($columnModel, $value){
    $obj = array();
    for($i = 0; $i < sizeof($columnModel); $i++){
        $type = null;
        if(isset($columnModel[$i]['editOption']['type'])){
            $type = $columnModel[$i]['editOption']['type'];
        }
        if($type == 'radio' || $type == 'checkbox' || $type == 'select'){
            $list = $columnModel[$i]['editOption']['list'];
            $obj[$columnModel[$i]['columnName']] = $list[mt_rand(0, sizeof($list)-1)]['value'];
        }else {
            $obj[$columnModel[$i]['columnName']] = $value . '_' . $i;
        }
    }
    return $obj;
}
function genRowSpan($obj, $max){
    if($max != 0) {
        foreach ($obj as $key => $value) {
            $luck = mt_rand(0, 5);
            //        $luck = 1;
            if ($luck == 0) {
                $obj['_extraData']['rowSpan'][$key] = mt_rand(1, $max);
            }
        }
    }
    return $obj;
}


for($i = 0; $i < $size; $i++){
    $remain = $size - 1 - $i;
    $obj = getRow($columnModel, $i+1);
    $obj = genRowSpan($obj, min($remain, 5));
    $data[] = $obj;
}


echo(json_encode($data));
?>