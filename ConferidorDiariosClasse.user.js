// ==UserScript==
// @name         Conferidor de Diários de Classe
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Analisa os diários de classe
// @author       Lucas Monteiro
// @run-at       document-end
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwgedteladocumento.aspx?0,34
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gov.br
// @grant        none
// @updateURL    https://raw.githubusercontent.com/lksoumon/AnaliseDiariosSigeduca/main/ConferidorDiariosClasse.user.js
// @downloadURL   https://raw.githubusercontent.com/lksoumon/AnaliseDiariosSigeduca/main/ConferidorDiariosClasse.user.js
// ==/UserScript==

window.print = function() {};

function encontrarEProcessarElemento() {
    // Encontra todos os elementos na página
    const elementos = document.querySelectorAll('span');

    for (let elemento of elementos) {
        // Verifica se o elemento tem o estilo de cor desejado
        const estilo = window.getComputedStyle(elemento);
        if (estilo.color === 'rgb(0, 0, 0)') {
            // Obtém o conteúdo do elemento e realiza o split por <br>
            const conteudo = elemento.innerHTML;
            const linhas = conteudo.split('<br>');

            if (linhas.length >= 3) {
                // Faz o split na terceira linha por "-" e retorna o primeiro elemento
                const partes = linhas[2].split('-');
                return partes[0].trim();
            }
        }
    }

    // Retorna null se nenhum elemento for encontrado ou não atender às condições
    return null;
}

let codEscola = encontrarEProcessarElemento();


let diasLetivos = [];
var ANO = document.getElementsByTagName('em')[2].innerText.trim();
//Iframe
var ifrIframe1 = document.createElement("iframe");
ifrIframe1.setAttribute("id","iframe1");
ifrIframe1.setAttribute("src","about:blank");
ifrIframe1.setAttribute("style","height: 100px; width: 355px;display:none");
ifrIframe1.onload = function() {
    const iframeWindow = ifrIframe1.contentWindow;

    for(var i = 1; i <= 30; i++){
        for(var j = 1; j <= 50; j++){
            let iserv = ("0000" + i).slice(-4);
            let jserv = ("0000" + j).slice(-4);//W00470001TLEGENDA_0002
            let datado = parent.frames[0].document.getElementById("span_W0047"+iserv+"vDATAINDICE_"+jserv);//console.log(i,j,datado);
            let datadoDisc = parent.frames[0].document.getElementById("W0047"+iserv+"TLEGENDA_"+jserv);//console.log(i,j,datadoDisc);
            if(datado != null && datadoDisc != null){
                let didia = parent.frames[0].document.getElementById("span_W0047"+iserv+"vDATAINDICE_"+jserv).innerText.trim();
                let discrica = parent.frames[0].document.getElementById("W0047"+iserv+"TLEGENDA_"+jserv).innerText.trim();
                //console.log('foi',discrica);
                if(discrica == "L" || discrica.includes("- L") || discrica.includes("L -")){

                    const [dia, mes, ano] = didia.split('/');
                    // Adiciona "20" na frente do ano para converter "yy" em "yyyy"
                    const anoCompleto = ano.length === 2 ? '20' + ano : ano;
                    didia = `${dia}/${mes}/${anoCompleto}`;

                    diasLetivos.push(didia);
                }
                //console.log(parent.frames[0].document.getElementById("span_W0047"+iserv+"vDATAINDICE_"+jserv).innerText.trim());
            }
        }
    }
    //console.log(diasLetivos);
};
ifrIframe1.src = "http://sigeduca.seduc.mt.gov.br/grh/hwmgrhcalendarioimp.aspx?"+ANO+","+codEscola;
document.getElementsByTagName('body')[0].appendChild(ifrIframe1);

let estilo = `<style>
    /* Classe 1 - outline e cor de fundo azul claro */
.classe-bg-card {
    outline: 1px solid black;
    background-color: lightblue;
    margin: 20px;
}

h3,span{
    margin: 10px;
}

/* Classe 2 - outline e cor de fundo cinza claro */
.classe-2 {
    outline: 1px solid black;
    background-color: lightgray;
    margin: 15px;
}

/* Classe 3 - outline e cor de fundo branco */
.classe-3 {
    outline: 1px solid black;
    background-color: white;
}

/* Classe 4 - outline e cor de fundo vermelho claro */
.classe-4 {
    outline: 1px solid black;
    background-color: lightcoral;
    margin: 5px;
}

/* Classe 5 - cor de fundo amarelo claro */
.classe-5 {
    background-color: lightyellow;
    outline: 1px solid black;
    margin: 5px;
}

/* Classe 6 - outline e cor de fundo verde claro */
.classe-6 {
    outline: 1px solid black;
    background-color: #32B232;
    margin: 5px;
}
</style>
`;

function diaDaSemana(data) {
    const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado','Domingo'];
    const partesData = data.split('/');
    const dataObj = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}`);
    const diaDaSemanaNumero = dataObj.getDay();
    return diasDaSemana[diaDaSemanaNumero];
}

function datasPorDiaDaSemana(dataInicio, dataFinal, diasSemana) {
    const datasEncontradas = [];

    let partesDataInicio = dataInicio.split('/');
    let partesDataFinal = dataFinal.split('/');

    let dataAtual = new Date(partesDataInicio[2], partesDataInicio[1] - 1, partesDataInicio[0], 12, 0, 0); // Define como meio-dia
    const dataFinalObj = new Date(partesDataFinal[2], partesDataFinal[1] - 1, partesDataFinal[0], 12, 0, 0); // Define como meio-dia

    while (dataAtual <= dataFinalObj) {
        const diaSemanaAtual = diaDaSemanaPorNumero(dataAtual.getDay());
        const quantidadeDias = parseInt(diasSemana[diaSemanaAtual] || 0);

        for (let i = 0; i < quantidadeDias; i++) {
            datasEncontradas.push(dataAtual.toLocaleDateString('pt-BR'));
        }

        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return datasEncontradas;
}

function diaDaSemanaPorNumero(numeroDia) {
    const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return diasDaSemana[numeroDia - 1];
}

function recorta(texto, ini, fim) {
    const temp = texto.split(ini);
    const temp2 = temp[1].split(fim);
    return temp2[0];
}

function verificaPeriodo(dA, dI, dF) {
    const dataA = new Date(dA.split('/').reverse().join('-'));
    const dataI = new Date(dI.split('/').reverse().join('-'));
    const dataF = new Date(dF.split('/').reverse().join('-'));

    return dataA >= dataI && dataA <= dataF;
}

function removerCaracteresIndesejados(nomeArquivo) {
    const caracteresNaoPermitidos = [" ", "\\", "/", ":", "*", "?", "\"", "<", ">", "|"];
    caracteresNaoPermitidos.forEach(char => {
        nomeArquivo = nomeArquivo.split(char).join('_');
    });

    return nomeArquivo;
}

function data1MaiorQueData2(data1, data2) {
    const timestampData1 = new Date(data1.split('/').reverse().join('-'));
    const timestampData2 = new Date(data2.split('/').reverse().join('-'));

    return timestampData1 > timestampData2;
}





var output = {};
output.dados = {};
output.dados.ano = ANO;
output.espelho = {};
output.conteudo = {};
function ultimoElementoTDPrimeiroTR(tabela) {
    // Obtém o primeiro elemento tr da tabela
    var primeiroTR = tabela.querySelector('tr');

    // Se não houver tr na tabela, retorna null
    if (!primeiroTR) {
        return null;
    }

    // Obtém todos os elementos td dentro do primeiro tr
    var tds = primeiroTR.querySelectorAll('td');

    // Se não houver td no primeiro tr, retorna null
    if (tds.length === 0) {
        return null;
    }

    // Retorna o último elemento td do primeiro tr
    return tds[tds.length - 1];
}
function formatarData(ano, dataString) {
    // Extrai o dia e o mês da string fornecida
    //console.log(dataString);
    var partes = dataString.split('\n');
    //console.log(partes);
    var dia = parseInt(partes[0]);
    var mes = parseInt(partes[1]);

    // Adiciona zero à esquerda se o dia ou mês for menor que 10
    var diaFormatado = dia < 10 ? '0' + dia : dia.toString();
    var mesFormatado = mes < 10 ? '0' + mes : mes.toString();

    // Retorna a data no formato dd/mm/aaaa
    return diaFormatado + '/' + mesFormatado + '/' + ano;
}
function recortarString(strPrincipal, strInicio, strFinal) {
    // Encontra o índice de início e final das strings
    var indiceInicio = strPrincipal.indexOf(strInicio);
    var indiceFinal = strPrincipal.indexOf(strFinal);

    // Se a string inicial ou final não for encontrada, retorna uma string vazia
    if (indiceInicio === -1 || indiceFinal === -1) {
        return "";
    }

    // Adiciona o comprimento da string inicial para obter o índice real de início
    indiceInicio += strInicio.length;

    // Retorna a substring entre o índice de início e o índice final
    return strPrincipal.substring(indiceInicio, indiceFinal).trim();
}

(function() {
    'use strict';

// ------ criar o menu

    // Cria o botão principal
    const menuButton = document.createElement('button');
    menuButton.textContent = 'Analisar diário';
    menuButton.style.position = 'fixed';
    menuButton.style.top = '10px';
    menuButton.style.right = '10px';
    menuButton.style.zIndex = '10000';
    menuButton.style.padding = '10px';
    menuButton.style.backgroundColor = '#4CAF50';
    menuButton.style.color = 'white';
    menuButton.style.border = 'none';
    menuButton.style.borderRadius = '5px';
    menuButton.style.cursor = 'pointer';

    // Cria o submenu
    const submenu = document.createElement('div');
    submenu.style.display = 'none';
    submenu.style.position = 'fixed';
    submenu.style.top = '50px';
    submenu.style.right = '10px';
    submenu.style.zIndex = '10000';
    submenu.style.padding = '10px';
    submenu.style.backgroundColor = '#f9f9f9';
    submenu.style.border = '1px solid #ccc';
    submenu.style.borderRadius = '5px';
    submenu.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';

     // Adiciona a descrição ao submenu
    const descricaoSubmenu = document.createElement('p');
    descricaoSubmenu.textContent = 'Informe a quantidade de aulas por dia do professor. Caso não queira fazer análise por dia, deixe todos os dias zerados.';
    descricaoSubmenu.style.marginBottom = '10px';
    submenu.appendChild(descricaoSubmenu);

    // Lista de dias da semana
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const inputs = {};

    // Cria os inputs para cada dia da semana
    diasSemana.forEach(dia => {
        const label = document.createElement('label');
        label.textContent = dia + ': ';
        label.style.display = 'block';
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        //input.type = 'number';
        input.value = '0';
        input.style.width = '100%';
        input.style.marginBottom = '10px';
        input.style.padding = '5px';
        input.style.borderRadius = '3px';
        input.style.border = '1px solid #ccc';

        inputs[dia] = input;
        label.appendChild(input);
        submenu.appendChild(label);
    });

    // Cria o botão para executar a função
    const executeButton = document.createElement('button');
    executeButton.textContent = 'Executar script';
    executeButton.style.display = 'block';
    executeButton.style.marginTop = '10px';
    executeButton.style.padding = '10px';
    executeButton.style.backgroundColor = '#4CAF50';
    executeButton.style.color = 'white';
    executeButton.style.border = 'none';
    executeButton.style.borderRadius = '5px';
    executeButton.style.cursor = 'pointer';

    submenu.appendChild(executeButton);

    // Adiciona os elementos ao corpo da página
    document.body.appendChild(menuButton);
    document.body.appendChild(submenu);

    // Função para alternar a visibilidade do submenu
    menuButton.addEventListener('click', () => {
        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
    });

    // Função para ser executada ao clicar no botão de execução
    executeButton.addEventListener('click', () => {
        const valores = {};
        diasSemana.forEach(dia => {
            valores[dia] = inputs[dia].value;
        });
        // Aqui você pode substituir pela função que você quer executar
        analise(output,valores);
        //console.log('Valores dos dias:', valores);
        //alert('Valores dos dias: ' + JSON.stringify(valores));
    });










// coletar os dados ------------------------------------------------
    window.addEventListener("load", function (event) {
        var tabelas = document.getElementsByTagName("table");
        //console.log("Todos os recursos terminaram o carregamento!");

         for (var n = 0; n < tabelas.length; n++) {
             var minhaTabela = tabelas[n];
             var ultimoTD = ultimoElementoTDPrimeiroTR(minhaTabela);

             if(ultimoTD){

   //-------------- Tabela com dados da turma -------------------------------------------------------------------
                 if(ultimoTD.getElementsByTagName("span")[0].textContent.trim() == "Disciplina:"){
                     //console.log(ultimoTD.getElementsByTagName("span")[0].textContent.trim());
                     var linhasDd = minhaTabela.getElementsByTagName("tr")[0].getElementsByTagName("tr");

                     var temp = linhasDd[0].getElementsByTagName("td")[2].getElementsByTagName("span")[0].textContent.trim();

                     output.dados.bimestre = recortarString(temp,'odo:','Ano:');

                     temp = linhasDd[1].getElementsByTagName("td")[1].getElementsByTagName("span")[2].textContent.trim();

                     output.dados.IP = recortarString(temp,'','FP:');
                     output.dados.FP = recortarString(temp,'FP:','Turma:');
                     output.dados.turma = recortarString(temp,'Turma:','Turno:');
                     output.dados.turno = temp.split('Turno:')[1].trim();


                     temp = linhasDd[2].getElementsByTagName("td")[0].getElementsByTagName("span")[4].textContent.trim();

                     output.dados.professor = temp;
                     //console.log(temText);

                     temp = linhasDd[3].getElementsByTagName("td")[0].getElementsByTagName("span")[4].textContent.trim();
                     output.dados.professorSubst = temp;

                     temp = linhasDd[3].getElementsByTagName("td")[1].getElementsByTagName("span")[2].textContent.trim();
                     output.dados.disciplina = temp;

                 }




//-------------- Tabela com lançamentos de faltas dos alunos -------------------------------------------------------------------
                 if(ultimoTD.getElementsByTagName("span")[0].textContent.trim() == "TF"){
                     var linhas = minhaTabela.getElementsByTagName("tr");
                     var datas = [];
                     for(var i = 0; i < linhas.length; i++){

                         if(i == 0 ){continue;}

                         if(i == 1 ){
                             var dias = linhas[i].getElementsByTagName("td");
                             for(var j = 0; j < dias.length; j++){
                                 var dataFormatada = formatarData(ANO, dias[j].getElementsByTagName("span")[0].innerText.trim());
                                 datas.push(dataFormatada);
                                 //console.log(dias[j].getElementsByTagName("span")[0]);
                             }
                             output.diasLan = datas;
                             continue;
                         }


                         var codigoEstudante = linhas[i].getElementsByTagName("td")[0].getElementsByTagName("span")[0].textContent.trim();
                         if(codigoEstudante == ''){continue;}

                         output.espelho[codigoEstudante] = {};
                         output.espelho[codigoEstudante].nome = linhas[i].getElementsByTagName("td")[2].getElementsByTagName("span")[0].textContent.trim();

                         var DD = datas.length;
                         output.espelho[codigoEstudante].nota = linhas[i].getElementsByTagName("td")[3+DD].getElementsByTagName("span")[0].textContent.trim();
                         output.espelho[codigoEstudante].totalFalta = linhas[i].getElementsByTagName("td")[4+DD].getElementsByTagName("span")[0].textContent.trim();
                         //console.log(codigoEstudante);
                         output.espelho[codigoEstudante].diario = {};
                         for(var k = 0; k < datas.length; k++){
                             output.espelho[codigoEstudante].diario[datas[k]] = linhas[i].getElementsByTagName("td")[3+k].getElementsByTagName("span")[0].textContent.trim();
                         }


                     }



                 }
     //-------------- Tabela com conteúdos lançados  -------------------------------------------------------------------
             if(ultimoTD.getElementsByTagName("span")[0].textContent.trim() == "Conteúdo"){

                 var linhasCONTEUDO = minhaTabela.getElementsByTagName("tr");

                 if(linhasCONTEUDO[2]){//console.log(linhasCONTEUDO[1]);
                     for(var r = 0; r < linhasCONTEUDO.length; r++){
                         if(r == 0 ){continue;}
                         var diaCont = linhasCONTEUDO[r].getElementsByTagName("td")[0].getElementsByTagName("span")[0].textContent.trim();
                         output.conteudo[diaCont] = linhasCONTEUDO[r].getElementsByTagName("td")[1].getElementsByTagName("span")[0].textContent.trim();
                     }
                 }
                 //console.log(linhasCONTEUDO);

             }


             }


         }


        //console.log(output['espelho']);
        //analise(output);

    


  });
    let semErros;
let hoje = new Date().toLocaleDateString('pt-BR');
function analise(turmalina,aulaSemana){
    let estimativaDias = 0;
    let IP = turmalina['dados']['IP'];
    let FP = turmalina['dados']['FP'];
    let turma = turmalina['dados']['turma'];
    let turno = turmalina['dados']['turno'];

    let ano = turmalina['dados']['ano'];
    let bimestre = turmalina['dados']['bimestre'];
    let professor = turmalina['dados']['professor'];
    let professorSubst = turmalina['dados']['professorSubst'];
    let disciplina = turmalina['dados']['disciplina'];

    let diasLan = turmalina['diasLan'];
    if (diasLan[0] === "NaN/NaN/2024") {
        diasLan.shift();
    }
    let contagem = diasLan.reduce((acc, dia) => {
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
    }, {});

    let conteudo = turmalina['conteudo'] || [];

    let profafas = (professor + professorSubst).split('-').slice(1);

    profafas = profafas.map(profefenho => {
        profefenho = profefenho.trim().replace(/[\d.,;_]/g, '');
        if (profefenho.endsWith(" e")) {
            profefenho = profefenho.slice(0, -2);
        }
        let key = turma + disciplina + profefenho;

        return profefenho;
    });

    let porcFF = {};
    let alunoNoDia = {};
    let alunosSemNota = [];

    Object.entries(turmalina.espelho).forEach(([cod, infos]) => {

        if (infos['nota'] === '' && !infos['nome'].includes('TRANSFERIDO') && !infos['nome'].includes('AFAST')) {
            alunosSemNota.push(`${cod} - ${infos['nome']}`);
        }

        for (let D in infos['diario']) {
            if (D === "NaN/NaN/2024") continue;

            porcFF[D] = porcFF[D] || 0;
            alunoNoDia[D] = alunoNoDia[D] || 0;

            let pres = infos['diario'][D].trim();
            if (pres === '.') {
                alunoNoDia[D]++;
            }
            if (pres === 'F') {
                porcFF[D]++;
                alunoNoDia[D]++;
            }
        }
    });

    for (let dd in porcFF) {
        porcFF[dd] = 100 * Math.round(porcFF[dd] / alunoNoDia[dd] * 100) / 100;
    }
//console.log('foi');
    //profafas.forEach(profefenho => {
        let relatorio = '';
        relatorio += '<div class="classe-bg-card">';
        relatorio += `<h3>${turma} - ${disciplina}: ${bimestre}</h3>`;
        relatorio += `<span>Período: de ${IP} à ${FP}</span><br>`;
        relatorio += `<span>Professor: ${professor} <br></span><span>Substituto: ${professorSubst}</span><br>`;




        //console.log(aulaSemana);

        var verificarPorDia = 0;
        Object.entries(aulaSemana).forEach(([chave, diasporsemana]) => {
            if (diasporsemana != 0){
                verificarPorDia = 1;
                //console.log(turmalina);
            }

        });

    console.log(diasLan);
        if(verificarPorDia == 1){

            let counts = {};

            for (const num of diasLan) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }



            //console.log(counts);
            //console.log(datasPorDiaDaSemana('01/01/2024','20/02/2024',aulaSemana));
            semErros = `<span class='classe-6'> ok! </span>`;
            relatorio += '<div class="classe-2">';
            relatorio += "<span>Dias lançados na data errada: ";

            diasLan.forEach(ddd => {
                if (ddd === "NaN/NaN/2024") return;
                //console.log(ddd,diaDaSemana(ddd), aulaSemana[diaDaSemana(ddd)]);
                if ( aulaSemana[diaDaSemana(ddd)] == 0 ) {semErros='';
                    relatorio += `<span class='classe-4'> ${ddd} (${diaDaSemana(ddd)})  </span>`;
                }
                if ( aulaSemana[diaDaSemana(ddd)] > 0 ) {
                    if(counts[ddd] != aulaSemana[diaDaSemana(ddd)] ){semErros='';
                        relatorio += `<span class='classe-4'> ${ddd} (${diaDaSemana(ddd)})  </span>`;
                    }

                }
            });

            relatorio += semErros;
            relatorio += '</span>';
            relatorio += '</div>';



            let datasComparar;



            if(data1MaiorQueData2(hoje,FP)){
                datasComparar = datasPorDiaDaSemana(IP,FP,aulaSemana);
            }else{
                datasComparar = datasPorDiaDaSemana(IP,hoje,aulaSemana);
            }
//console.log(datasComparar);
            let countsComparar = {};

            for (const num of datasComparar) {
                countsComparar[num] = countsComparar[num] ? countsComparar[num] + 1 : 1;
            }
            console.log(IP,FP,datasComparar,counts);


            datasComparar.forEach(function(elemento, indice) {
            //console.log(`Elemento: ${elemento}, Índice: ${indice}`);
                if(diasLetivos.includes(elemento)){
                    estimativaDias++;
                }
        });



            relatorio += '<div class="classe-2">';
            relatorio += "<span>Dias não lançados nos dias selecionados: ";
            semErros = `<span class='classe-6'> ok! </span>`;
            datasComparar.forEach(ddd => {
                if (ddd === "NaN/NaN/2024") return;
                if (diaDaSemana(ddd) === "Domingo") return;
                if (diasLetivos != []){
                    if(!diasLetivos.includes(ddd)){return;}
                };
                //console.log(diaDaSemana(ddd), aulaSemana[diaDaSemana(ddd)]);
                if ( counts[ddd] ) {

                    if ( countsComparar[ddd] != counts[ddd] ) {
                        semErros='';
                        relatorio += `<span class='classe-4'> ${ddd} (${diaDaSemana(ddd)})  </span>`;

                    }

                }else{semErros='';
                    relatorio += `<span class='classe-4'> ${ddd} (${diaDaSemana(ddd)})  </span>`;
                }

            });
            relatorio += semErros;
            relatorio += '</span>';
            relatorio += '</div>';

        }

    //qtde de dias lançados
        relatorio += '<div class="classe-2">';
        relatorio += `<span>Dias lançados: ${diasLan.length}</span>`;

        if (diasLan.length === 0) {
            relatorio += "<span class='classe-4'> - Nenhum dia lançado</span>";
        }

    if (verificarPorDia == 1) {
            relatorio += "<span class='classe-2'> Estimativa de dias no período: "+estimativaDias+"</span>";
    }

        relatorio += '<br>';
        relatorio += '</div>';


        relatorio += '<div class="classe-2">';
        relatorio += "<span>Dias lançados sem conteúdo: ";
        semErros = `<span class='classe-6'> ok! </span>`;
        diasLan.forEach(ddd => {
            if (ddd === "NaN/NaN/2024") return;
            if (!conteudo[ddd]) {semErros='';
                relatorio += `<span class='classe-4'> ${ddd} </span>`;
            }
        });

        relatorio += semErros;
        relatorio += '</span>';
        relatorio += '</div>';

        relatorio += '<div class="classe-2">';
        relatorio += "<span>Conteúdos sem data lançada em diário: ";
        semErros = `<span class='classe-6'> ok! </span>`;
        for (let keya in conteudo) {
            if (!diasLan.includes(keya)) {semErros='';
                relatorio += `<span class='classe-4'> ${keya} </span>`;
            }
        }

        relatorio += semErros;
        relatorio += '</span><br>';
        relatorio += '</div>';

        relatorio += '<div class="classe-2">';
        relatorio += "<span>Datas com muitos alunos faltosos: ";
        semErros = `<span class='classe-6'> ok! </span>`;

        for (let ddd in porcFF) {
            if (porcFF[ddd] >= 80) {semErros='';
                relatorio += `<span class='classe-4'>  ${ddd} -> ${porcFF[ddd]}% </span>`;
            }
        }

        relatorio += semErros;
        relatorio += '</span>';
        relatorio += '</div>';

        

        if (data1MaiorQueData2(hoje, FP)) {
            relatorio += '<div class="classe-2">';
            relatorio += "<span>Alunos sem lançamento de nota: ";
            semErros = `<span class='classe-6'> ok! </span>`;

            alunosSemNota.forEach(nnn => {semErros='';
                relatorio += `<span class='classe-4'>  ${nnn} </span>`;
            });

            relatorio += semErros;
            relatorio += '</span>';
            relatorio += '</div>';
        }



        relatorio += '<div class="classe-2">';
        relatorio += "<span>Conteúdos: <br>";
        for (let keya in conteudo) {
            relatorio += `<span>${keya} - ${conteudo[keya]}`;
            if (!diasLan.includes(keya)) {
                relatorio += "<span class='classe-4'>[CONTEÚDO SEM DATA LANÇADA EM DIÁRIO]</span>";
            }
            relatorio += '</span><br>';
        }

        if (conteudo.length === 0) {
            relatorio += "<span class='classe-4'>Nenhum conteúdo detectado!</span> <br>";
        }

        relatorio += '</span>';
        relatorio += '</div>';

        relatorio += "</div>";


        let newWindow = window.open("", "_blank", "width=1200,height=800");
        newWindow.document.write(estilo+relatorio);
        newWindow.document.close();

        let turmaCorrigida = removerCaracteresIndesejados(turma + ' - ' + disciplina);
    //});





}


    // Your code here...
})();
