<?php
header('Access-Control-Allow-Origin: *');

$columnModel = json_decode(stripslashes($_REQUEST['columnModel']), true);
if(is_null($columnModel)){
    $columnModel = json_decode($_REQUEST['columnModel'], true);
}
//var_dump($_REQUEST['columnModel']);
//var_dump(json_decode(stripslashes($_REQUEST['columnModel'])));
//var_dump(json_decode(stripslashes($_REQUEST['columnModel']), true));
$page = (isset($_REQUEST['page'])) ? $_REQUEST['page'] : 1;
$perPage = (isset($_REQUEST['perPage'])) ? $_REQUEST['perPage'] :  5;
$rowState = (isset($_REQUEST['rowState'])) ? $_REQUEST['rowState'] :  '';
$totalCount = 99999;

$contents = array();
function getRow($columnModel, $value){
    $obj = array();
    for($i = 0; $i < sizeof($columnModel); $i++){
        if($columnModel[$i]['columnName'] != '_button' && $columnModel[$i]['columnName'] != '_number') {
            $type = null;
            if (isset($columnModel[$i]['editOption']['type'])) {
                $type = $columnModel[$i]['editOption']['type'];
            }
            if ($type == 'radio' || $type == 'checkbox' || $type == 'select') {
                $list = $columnModel[$i]['editOption']['list'];
                $obj[$columnModel[$i]['columnName']] = $list[mt_rand(0, sizeof($list) - 1)]['value'];
            } else {
                $obj[$columnModel[$i]['columnName']] = $value . '_' . $i;
            }
        }
    }
    return $obj;
}

function genRowSpan($obj, $max){
    global $rowState;
    if($max != 0) {
        foreach ($obj as $key => $value) {
            $luck = mt_rand(0, 5);
            //        $luck = 1;
            if ($luck == 0) {
                $obj['_extraData']['rowSpan'][$key] = mt_rand(1, $max);
            }
            $obj['_extraData']['rowState'] = $rowState;
        }
    }
    return $obj;
}
$startCount = ($page - 1)* $perPage;
for($i = 0; $i < $perPage; $i++){
    if ($startCount + $i > $totalCount) {
        break;
    }
    $remain = min($perPage - 1 - $i, $totalCount - ($startCount + $i));
    $obj = getRow($columnModel, $i+1);
    $obj = genRowSpan($obj, min($remain, 5));
    $contents[] = $obj;
}


$data["result"] = true;
$data["data"] = array();
$data["data"]["contents"] = $contents;
$data["data"]["message"] = 'error';
$data["data"]["pagination"] = array();
$data["data"]["pagination"]["page"] = $page;
$data["data"]["pagination"]["totalCount"]  = $totalCount;
//$data["query"] = $executeQuery;

echo(json_encode($data));
?>