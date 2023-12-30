var BTN = document.querySelector("#bText");
  var TEXTAREA = document.querySelector("#textSpeech");
  var DIV = document.querySelector("#response_msg");
  var BTN_MIC = document.querySelector("#bMic");
  var CHAT_AREA = document.querySelector(".chat-container");
  var BTN_Speak = document.querySelector("#bSpeak");

  var recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  let chatHistory= '';
  let recognitionStatus = false;
 
  // Event listeners
  BTN.addEventListener("click", chatBot);
  BTN_MIC.addEventListener("click", speechToText);
  BTN_Speak.addEventListener("click", TextToSpeechAll);
  

  // Function to send text from TEXTAREA to the backend for analysis
  function chatBot() {
    console.log('send btn clicked')
    let text = TEXTAREA.value;
    chatHistory += text + '\n';
    CHAT_AREA.innerHTML += `<div class="chat-bubble sender right">${text}</div><div class="clearfix"></div>`;

    var url_backend = "http://127.0.0.1:8000/cuisine"

    fetch(url_backend, {
      method: "POST",
      body: JSON.stringify({"texte": text}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        response.json()
          .then(data => {
            BTN_Speak.style.display = "" 
            console.log(data.msg)
            chatHistory += data.msg + '\n';
            // DIV.innerHTML=data.msg
            CHAT_AREA.innerHTML += `<div class="chat-bubble receiver float-right">${data.msg}</div>
            <button id="speak-btn" class="btn btn-danger play-btn" onClick="TextToSpeech('${data.msg}')">
                            <i class="bi bi-play-fill"></i>
                        </button>
            <div class="clearfix"></div>`;
          });
      })
      .catch(error => {
        console.warn(error);
      });
  }


  // Function to start speech-to-text functionality
  function speechToText() {
    // alert("Speech to text ready");
    if (recognitionStatus) {
      recognition.stop();
      recognitionStatus = false;
      document.querySelector("#bMic").classList.remove("btn-primary");
      document.querySelector("#bMic").classList.add("btn-danger");
      return;
    }
    recognition.start();
    recognitionStatus = true;
    document.querySelector("#bMic").classList.remove("btn-danger");
    document.querySelector("#bMic").classList.add("btn-primary");
  }

  function TextToSpeech(texte) {
      let utterance = new SpeechSynthesisUtterance(texte);
      speechSynthesis.speak(utterance);
  }
  function TextToSpeechAll() {
      let utterance = new SpeechSynthesisUtterance(chatHistory);
      speechSynthesis.speak(utterance);
  }

  // Event handler for speech recognition results
  recognition.onresult = function(event) {
    var message = event.results[0][0].transcript;
    console.log('Result received: ' + message + '.');
    console.log('Confidence: ' + event.results[0][0].confidence);
    TEXTAREA.value = message;
  };

