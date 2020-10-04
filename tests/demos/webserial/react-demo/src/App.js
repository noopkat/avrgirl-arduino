import React, { useState, useRef } from "react";
import AvrgirlArduino from "./avrgirl-arduino";
import "./style.css";
import ArduinoUno from "./img/ArduinoUno.svg";
import gear from "./img/gear4.svg";

function App() {
  const boardChoices = [
    "micro",
    "uno",
    "mega"
  ];

  const fileInput = useRef(null);
  const [board, updateBoard] = useState(boardChoices[0]);
  const [fileName, updateFileName] = useState("");
  const [uploading, updateUploading] = useState(false);

    const handleSubmit = e => {
    e.preventDefault();
    updateUploading(true);

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileInput.current.files[0]);

    reader.onload = event => {
      const filecontents = event.target.result;

      const avrgirl = new AvrgirlArduino({
        board: board,
        debug: true
      });

      avrgirl.flash(filecontents, error => {
        if (error) {
          console.error(error);
        } else {
          console.info("flash successful");
        }
        updateUploading(false);
      });
    };
  };

  const BoardOptions = boardChoices.map((board, i) => <option value={board} key={i}>{board}</option>)
  

  return (
    <div className="main">
      <div className="wrapper">
        <div className="bot">
          <h1>Upload-o-matic</h1>
          <p>Choose a program to upload to an arduino</p>

          <form id="uploadForm" onSubmit={handleSubmit}>
            <label>
              Board:
              <select
                id="boardType"
                value={board}
                onChange={event => updateBoard(event.target.value)}
              >
                {BoardOptions}   
              </select>
            </label>

            <label>
              Program:
              <div className="fileButtonWrapper">
                <button
                  id="fileButton"
                  type="button"
                  aria-controls="fileInput"
                  onClick={() => fileInput.current.click()}
                >
                  Choose file
                </button>
                <input
                  id="fileInput"
                  tabIndex="-1"
                  type="file"
                  ref={fileInput}
                  onChange={() =>
                    updateFileName(fileInput.current.files[0].name)
                  }
                />
                <span id="fileName">
                  {fileName ? fileName : "no file chosen"}
                </span>
              </div>
            </label>

            <button type="submit" id="uploadBtn">
              Upload!
            </button>
          </form>
        </div>

        <div className="board">
          <img src={ArduinoUno} alt="arduino board" />
        </div>
        <div id="pipe"></div>
        <div id="progress"></div>
        <div id="gear">
          <img
            src={gear}
            alt="gear icon"
            className={uploading ? "spinning" : null}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
