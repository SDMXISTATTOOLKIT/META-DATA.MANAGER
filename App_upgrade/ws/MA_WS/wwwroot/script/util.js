function setError(node, errorMessage) {
    node.className = "error";
    node.textContent = errorMessage;
}

function setSuccess(node, errorMessage) {
    node.className = "success";
    node.textContent = errorMessage;
}

function hideElement(id, hide) {
    const node = document.getElementById(id);
    if (hide) {
        node.style.display = 'none';
    }
    else {
        node.style.display = 'block';
    }
}