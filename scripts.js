const baseUrl = `//localhost/pw3/0427/backend/`

let modal = null
let btnSalvar = null
let btnAlterar = null

let loading = null

onload = async () => {
    modal = new bootstrap.Modal(document.getElementById('exampleModal'))
    btnSalvar = document.getElementById("salvar")
    btnAlterar = document.getElementById("alterar")
    loading = document.getElementById('loading')

    btnSalvar.addEventListener("click", async () => {
        toggleButton(btnSalvar)

        const nome = document.getElementById("nome").value
        const sobrenome = document.getElementById("sobrenome").value
        const dtnasc = document.getElementById("dtnasc").value

        const body = new FormData()
        body.append('nome', nome)
        body.append('sobrenome', sobrenome)
        body.append('dtnasc', dtnasc)

        const response = await fetch(`${baseUrl}salvar.php`, {
            method: "POST",
            body
        })
        const pessoa = await response.json()

        const [tbody] = document.getElementsByTagName('tbody')
        const tr = criarLinha(pessoa)
        tbody.appendChild(tr)

        modal.hide();
        toggleButton(btnSalvar)
    })

    btnAlterar.addEventListener('click', async () => {
        toggleButton(btnAlterar)
        const nome = document.getElementById("nome").value
        const sobrenome = document.getElementById("sobrenome").value
        const dtnasc = document.getElementById("dtnasc").value
        const id = document.getElementById('id').value

        const body = new FormData()
        body.append('nome', nome)
        body.append('sobrenome', sobrenome)
        body.append('dtnasc', dtnasc)

        const response = await fetch(`${baseUrl}alterar.php?id=${id}`, {
            method: "POST",
            body
        })
        const pessoa = await response.json()
        atualizarLinha(pessoa)

        modal.hide();
        toggleButton(btnAlterar)
    })

    const novo = document.getElementById("novo")
    novo.addEventListener('click', () => {
        preencheFormulario()
        btnAlterar.style.display = 'none'
        btnSalvar.style.display = 'inline'
    })

    await carregaPessoas()
}

const  criarLinha = ({id, nome, sobrenome, dtnasc}) => {
    const tr = document.createElement("TR")
    tr.setAttribute('id', id)
    tr.innerHTML = `<td>${nome}</td>
    <td>${sobrenome}</td>
    <td>${dtnasc.split("-").reduce((a,b) => `${b}/${a}`, "").slice(0,-1)}</td>`

    const btnEdit = novoBotao('warning', 'pencil', () => {
        preencheFormulario(id, nome, sobrenome, dtnasc)
        btnAlterar.style.display = 'inline'
        btnSalvar.style.display = 'none'
        modal.show()
    })
    
    const btnDelete = novoBotao('danger', 'trash', async () => {
        toggleLoading()
        const response = await fetch(`${baseUrl}remover.php?id=${id}`,{
            method: "DELETE"
        })
        await response.json()
        
        // await carregaPessoas()
        const [tbody] = document.getElementsByTagName('tbody')
        tbody.childNodes.forEach(tr=> {
            if (tr.getAttribute('id') == id) 
                tbody.removeChild(tr)
        })
        toggleLoading()
    })

    const td = document.createElement("TD")
    td.appendChild(btnEdit)
    td.appendChild(btnDelete)
    tr.appendChild(td)
    return tr;
}

const carregaPessoas = async () => {
    toggleLoading()
    const [tbody] = document.getElementsByTagName('tbody')
    tbody.innerHTML = ""

    const response = await fetch(`${baseUrl}index.php`)
    const pessoas = await response.json()
    pessoas.forEach(pessoa => {
        const tr = criarLinha(pessoa)
        tbody.appendChild(tr)
    })  
    toggleLoading()
}

const novoBotao = (color, icon, cb, label = "") => {
    const btn = document.createElement("BUTTON")
    btn.setAttribute('type','button')
    btn.setAttribute('class', `btn btn-${color} btn-sm`)
    btn.innerHTML = `<i class='fa-solid fa-${icon}'></i> ${label}`
    btn.addEventListener('click', cb)
    return btn
}

const preencheFormulario = (id = "", nome = "", sobrenome = "", dtnasc = "") => {
    const nomeInput = document.getElementById('nome')
    const sobrenomeInput = document.getElementById('sobrenome')
    const dtnascInput = document.getElementById('dtnasc')
    const idInput = document.getElementById('id')

    nomeInput.value = nome
    sobrenomeInput.value = sobrenome
    dtnascInput.value = dtnasc
    idInput.value = id
}

const atualizarLinha = (pessoa) => {    
    const [tbody] = document.getElementsByTagName('tbody')
    tbody.childNodes.forEach(tr=> {
        if (tr.getAttribute('id') == pessoa.id) {
            const nova = criarLinha(pessoa)
            tbody.insertBefore(nova, tr)
            tbody.removeChild(tr)
        }
    })
}

const toggleButton = btn => {
    btn.disabled = !btn.disabled
    btn.childNodes.forEach((el) => {
        if (el.nodeName === 'SPAN'){
            el.classList.toggle('visually-hidden')
        }
    })
}

const toggleLoading = () => 
    loading.classList.toggle('visually-hidden')