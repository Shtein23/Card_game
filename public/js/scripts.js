$(document).ready(function(){ 



$("#NoCena").prop("checked", true);//ЧЕКБОКС TRUE ПО УМОЛЧАНИЮ

// УСТАНОВКА ЦВЕТА СЕЛЕКТОРА СЕРЫМ ЕСЛИ НЕ ВЫБРАНА КАТЕГОРИЯ----------------------------------
$("#SelectorCtg").css('color','gray')
$("#SelectorCtg").change(function(){ 
    if($(this).val() == 0){
        $("#SelectorCtg").css('color','gray')

    } else {
        $("#SelectorCtg").css('color', '#000')
    }
});
// УСТАНОВКА ЦВЕТА СЕЛЕКТОРА СЕРЫМ ЕСЛИ НЕ ВЫБРАНА КАТЕГОРИЯ----------------------------------


// УСТАНОВКА ЦВЕТА СЕЛЕКТОРА СЕРЫМ ЕСЛИ НЕ ВЫБРАНА РАЗДЕЛ-------------------------------------
$("#SelectorApple").css('color','gray')
$("#SelectorApple").change(function(){ 
    if($(this).val() == 0){
        $("#SelectorApple").css('color','gray')

    } else {
        $("#SelectorApple").css('color', '#000')
    }
});
// УСТАНОВКА ЦВЕТА СЕЛЕКТОРА СЕРЫМ ЕСЛИ НЕ ВЫБРАНА РАЗДЕЛ-------------------------------------


// ВЫБОР КАТЕГОРИИ----------------------------------------------------------------------------
$("#SelectorCtg").change(function(){ 
        $('input[type="radio"]').prop('checked', false);
        $('#SelectorApple').prop('selectedIndex',0);
        $("#SelectorApple").css('color','gray')
        $("#SearchAppleMac").collapse('hide');
        $("#SearchAppleMacBook").collapse('hide');
        $("#SearchAppleAppleTV").collapse('hide');
        $("#catcen").collapse('show');
    if($(this).val() == 0){
        $("#SearchApple").collapse('hide');
        $("#SearchPC1").collapse('hide');
        $("#SearchNout").collapse('hide');
        $("#SearchMono").collapse('hide');
        $("#exmplsearch").val("");
} else if ($(this).val() == 1){
        $("#SearchApple").collapse('show');
        $("#SearchPC1").collapse('hide');
        $("#SearchNout").collapse('hide');
        $("#SearchMono").collapse('hide');
        $("#exmplsearch").val("Apple");
} else if ($(this).val() == 2){
        $("#SearchApple").collapse('hide');
        $("#SearchPC1").collapse('show');
        $("#SearchNout").collapse('hide');
        $("#SearchMono").collapse('hide');
        $("#exmplsearch").val("Готовые ПК");
} else if ($(this).val() == 3){
        $("#SearchNout").collapse('show');
        $("#SearchApple").collapse('hide');
        $("#SearchMono").collapse('hide');
        $("#SearchPC1").collapse('hide');
        $("#exmplsearch").val("Ноутбуки");
} else if ($(this).val() == 4){
        $("#SearchMono").collapse('show');
        $("#SearchApple").collapse('hide');
        $("#SearchNout").collapse('hide');
        $("#SearchPC1").collapse('hide');
        $("#exmplsearch").val("Моноблоки");

}}); 
// ВЫБОР КАТЕГОРИИ---------------------------------------------------------------------------


// ВЫБОР ЛИНЕЕК APPLE------------------------------------------------------------------------
$("#SelectorApple").change(function(){ 
        $('input[type="radio"]').prop('checked', false);
    if($(this).val() == 0){
        $("#SearchAppleMac").collapse('hide');
        $("#SearchAppleMacBook").collapse('hide');
        $("#SearchAppleAppleTV").collapse('hide');
        $("#exmplsearch").val("Apple");
} else if ($(this).val() == 1){
        $("#SearchAppleMac").collapse('show');
        $("#SearchAppleMacBook").collapse('hide');
        $("#SearchAppleAppleTV").collapse('hide');
        $("#exmplsearch").val("Mac");
} else if ($(this).val() == 2){
        $("#SearchAppleMac").collapse('hide');
        $("#SearchAppleMacBook").collapse('show');
        $("#SearchAppleAppleTV").collapse('hide');
        $("#exmplsearch").val("MacBook");
} else if ($(this).val() == 3){
        $("#SearchAppleAppleTV").collapse('show');
        $("#SearchAppleMac").collapse('hide');
        $("#SearchAppleMacBook").collapse('hide');
        $("#exmplsearch").val("Apple TV");
        $("#123").text("любая");
        $( "#customRange3" ).val("$");
        $("#NoCena").prop("checked", true);

}}); 
// ВЫБОР ЛИНЕЕК APPLE-----------------------------------------------------------------------




// ДЛЯ APPLE TV БЕЗ УЧЕТА ЦЕНЫ-------------------------------------------------------------- 
$("#SelectorApple").change(function(){ 
    if($(this).val() == 3){
        $("#catcen").collapse('hide');
} else {
    $("#catcen").collapse('show');
}
});
// ДЛЯ APPLE TV БЕЗ УЧЕТА ЦЕНЫ--------------------------------------------------------------



// ВЫБОР МОДЕЛЕЙ ИЗ ЛИНЕЕК ЭППЛ-------------------------------------------------------------
$("[type=radio]").change(function() {
var selected = $("input[type='radio'][name='RadioApple']:checked").val();
if (selected == 7) {
    $("#exmplsearch").val("Apple TV 4k");
} else if (selected == 8) {
    $("#exmplsearch").val("Apple TV");
} else if (selected == 4) {
    $("#exmplsearch").val("MacBook");
} else if (selected == 1) {
    $("#exmplsearch").val("iMac");
} else if (selected == 2) {
    $("#exmplsearch").val("iMac Pro");
} else if (selected == 3) {
    $("#exmplsearch").val("Mac Pro");
} else if (selected == 5) {
    $("#exmplsearch").val("MacBook Air");
} else if (selected == 6) {
    $("#exmplsearch").val("MacBook Pro");
}
}); 
// ВЫБОР МОДЕЛЕЙ ИЗ ЛИНЕЕК ЭППЛ--------------------------------------------------------------


// ВЫБОР ПК----------------------------------------------------------------------------------
$("[type=radio]").change(function() {
var selected = $("input[type='radio'][name='RadioPC']:checked").val();
if (selected == 1) {
    $("#exmplsearch").val("Готовые ПК для работы");
} else if (selected == 2) {
    $("#exmplsearch").val("Готовые ПК для дома");
} else if (selected == 3) {
    $("#exmplsearch").val("Готовые игровые ПК");
} 

});
// ВЫБОР ПК----------------------------------------------------------------------------------

// ВЫБОР НОУТБУКА----------------------------------------------------------------------------
$(".Nout").change(function() {
var selected = $("input[type='radio'][name='RadioNout']:checked").val();
if (selected == 1) {
    $("#exmplsearch").val("Ноутбуки Asus");
} else if (selected == 2) {
    $("#exmplsearch").val("Ноутбуки HP");
} else if (selected == 3) {
    $("#exmplsearch").val("Ноутбуки Xiaomi");
} else if (selected == 4) {
    $("#exmplsearch").val("Ноутбуки Lenovo");
} else if (selected == 5) {
    $("#exmplsearch").val("Ноутбуки Razer");
} 

});
// ВЫБОР НОУТБУКА----------------------------------------------------------------------------


// ВЫБОР МОНОБЛОКА---------------------------------------------------------------------------
$(".Mono").change(function() {
var selected = $("input[type='radio'][name='RadioMono']:checked").val();
if (selected == 1) {
    $("#exmplsearch").val("Моноблоки Lenovo");
} else if (selected == 2) {
    $("#exmplsearch").val("Моноблоки Acer");
} else if (selected == 3) {
    $("#exmplsearch").val("Моноблоки Dell");
} else if (selected == 4) {
    $("#exmplsearch").val("Моноблоки HP");
} 
});
// ВЫБОР МОНОБЛОКА---------------------------------------------------------------------------


// ИЗМЕНЕНИЕ ЦЕНЫ----------------------------------------------------------------------------
  $("[type=range]").change(function(){
    $("#NoCena").prop("checked", this.checked);
    var newv=$(this).val();
    if(newv < 30){
    $("#123").text('Малая стоимость');}
    if((newv >= 30) && (newv <=70)){
    $("#123").text('Средние варианты между ценой и мощностью');}
    if(newv > 70){
    $("#123").text('Максимальные комплектации');}
});
// ИЗМЕНЕНИЕ ЦЕНЫ----------------------------------------------------------------------------

// Чекбокс ДЛЯ СБРОСА ЦЕНЫ-------------------------------------------------------------------
$('#NoCena').click(function() {
    if (this.checked){
            $("#123").text("любая");
            $( "#customRange3" ).val("$");
    } else {
            $("#123").text("Средние варианты между ценой и мощностью");
            $( "#customRange3" ).val("50");
    }
}); 
// Чекбокс ДЛЯ СБРОСА ЦЕНЫ-------------------------------------------------------------------

});