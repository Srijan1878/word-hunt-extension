//modal visibility flag
let isModalOpen = false
let isActivated = false
let modalTimeoutId;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    isActivated = request.activate
    renderToastify(request.activate)
})

//creating toastyify element
const toastify = document.createElement('div')
document.body.append(toastify)
toastify.classList.add('toastify')

//creating the floating modal
const floatingModal = document.createElement('div')
floatingModal.classList.add('floatingModal')
document.body.append(floatingModal)
const floatingModalWrapper = document.createElement('div')
floatingModal.appendChild(floatingModalWrapper)
floatingModalWrapper.classList.add('floatingModalWrapper')

//creating the close Icon
const closeIcon = document.createElement('img')
closeIcon.src = 'https://www.linkpicture.com/q/close_7.png'
closeIcon.classList.add('closeIcon')
closeIcon.onclick = hideModal
floatingModalWrapper.appendChild(closeIcon)

//function to render the toastify message
function renderToastify(isActivated) {
    const toastifyMessage = document.createElement('h3')
    toastifyMessage.innerHTML = `WordHunt ${isActivated ? 'Enabled' : 'Disabled'}`
    if (toastify.children.length > 0) toastify.removeChild(toastify.children[0])
    toastify.appendChild(toastifyMessage)
    toastify.classList.add('toastify-visible')
    modalTimeoutId = setTimeout(() => {
        toastify.classList.remove('toastify-visible')
    }, 1000)
}

//function to hide the modal
function hideModal() {
    floatingModal.classList.remove("show")
    floatingModalWrapper.innerHTML = ''
    floatingModalWrapper.appendChild(closeIcon)
    isModalOpen = false
    window.getSelection().empty()
}

//creating the modal content on text selection event
document.addEventListener('mouseup', debounce(renderModalContent, 1000))

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        timeoutId && clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    }
}

//checking if there is a audio file present for the word
function checkIfAudioPresent(wordMeaning) {
    let soundObj = {}
    wordMeaning[0].phonetics.forEach(phonetic => {
        if (soundObj.present) return
        if (phonetic.audio) {
            soundObj.present = true
            soundObj.audio = phonetic.audio
        }
    })
    return soundObj
}

//function for creating a Audio instance and playing it
function playAudio(audio) {
    let sound = new Audio(audio)
    sound.play()
}

//The main logic goes here: interacting with the DOM to create elements for the modal and paiting them on the screen
async function fetchMeaningAndDisplay(word) {
    let wordMeaning = await fetchWordMeaning(word)
    const meanings = wordMeaning[0].meanings[0].definitions
    const meaningsFragment = document.createDocumentFragment()
    const originalWord = document.createElement('h3')
    originalWord.innerHTML = word.toUpperCase()
    meaningsFragment.appendChild(originalWord)
    const pronunciationWrapper = document.createElement('div')
    const pronunciation = document.createElement('h4')
    pronunciation.innerHTML = wordMeaning[0].phonetic
    pronunciationWrapper.classList.add('pronunciationWrapper')
    meaningsFragment.appendChild(pronunciationWrapper)
    let soundPresent = checkIfAudioPresent(wordMeaning)
    if (soundPresent.present) {
        const playLogo = document.createElement('img')
        playLogo.src = 'https://www.linkpicture.com/q/Vector_17.png'
        pronunciationWrapper.appendChild(playLogo)
        playLogo.onclick = () => {
            playAudio(soundPresent.audio)
        }
    }
    pronunciationWrapper.append(pronunciation)
    meanings.forEach((meaning, index) => {
        const meaningEl = document.createElement('p')
        meaningEl.innerHTML = `${index + 1}.${meaning.definition}`
        meaningsFragment.appendChild(meaningEl)
    })
    floatingModalWrapper.appendChild(meaningsFragment)
    isModalOpen = true
}

//function to extract the selected word and call the fetchMeaningAndDisplay function
function renderModalContent(e) {
    const selectedWord = window.getSelection().toString().trim()
    if (!isActivated || !selectedWord || isModalOpen) return
    //creating the modal
    if (floatingModalWrapper.children.length > 1) hideModal()
    floatingModal.classList.add("show")
    floatingModal.setAttribute(
        'style',
        `top: ${e.clientY / window.innerHeight * 100}%;
        left: ${e.clientX / window.innerWidth * 100}%;`
    )
    fetchMeaningAndDisplay(selectedWord)
}

//function for making a call to the api and fetching the meaning of the word
function fetchWordMeaning(word) {
    return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
}