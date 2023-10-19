import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./Card.module.css";
import { ReactComponent as SuccessIcon } from "../../assets/vectors/success.svg";
import { ReactComponent as DangerIcon } from "../../assets/vectors/danger.svg";
import { ReactComponent as ArrowIcon } from "../../assets/vectors/arrow.svg";

function Card(props) {
  const {
    onInput,
    title,
    accept,
    id,
    buttonTitle,
    onClick,
    hasInput = false,
    possibleStatus,
    httpCallStatus,
    currentStatus,
    setCurrentStatus,
  } = props;
  const [fileName, setFileName] = useState("");
  const disableButton = fileName.length === 0 && hasInput;

  const { IN_PROGRESS, SUCCESS, ERROR } = possibleStatus;

  const showStatusCases = [IN_PROGRESS, SUCCESS, ERROR];

  function handleFileInputChange(e) {
    const file = e.target.files[0];
    setFileName(file.name);
    onInput(e);
  }

  return (
    <div className={styles.card}>
      {title && <h2 className={styles.title}>Subir archivos</h2>}
      <div className={styles.content}>
        <div className={styles.buttonsContainer}>
          {showStatusCases.includes(httpCallStatus) ? (
            <div className={styles.httpCallFeedbackContainer}>
              {httpCallStatus === IN_PROGRESS && (
                <>
                  <div className={styles.spinner} />
                  <p>Generando proyectos...</p>
                </>
              )}
              {httpCallStatus === SUCCESS && (
                <>
                  <div className={styles.successIcon}>
                    <SuccessIcon className={styles.icon} />
                  </div>
                  <p className={styles.text}>
                    Proyectos generados correctamente!
                  </p>
                </>
              )}
              {httpCallStatus === ERROR && (
                <>
                  <div className={styles.dangerIcon}>
                    <DangerIcon className={styles.icon} />
                  </div>
                  <p className={styles.text}>
                    Se ha producido un error, intentelo mas tarde, sentimos las
                    molestias.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {hasInput && (
                <div className={styles.button}>
                  <label className={styles.buttonLabel} htmlFor={id}>
                    {fileName || props.label}
                  </label>
                  <input
                    type="file"
                    name="fileInput"
                    id={id}
                    accept={accept}
                    hidden
                    onInput={handleFileInputChange}
                  />
                </div>
              )}
              <button
                disabled={disableButton}
                className={
                  disableButton
                    ? styles.disabledSubmitButton
                    : styles.submitButton
                }
                type="submit"
                onClick={() => {
                  onClick();
                  setFileName("");
                }}
              >
                {buttonTitle}
              </button>
            </>
          )}
        </div>
      </div>
      {currentStatus > 0 &&
        httpCallStatus === possibleStatus.NOT_IN_PROGRESS && (
          <button
            className={styles.goBackButton}
            onClick={() => {
              setCurrentStatus((prev) => prev - 1);
              setFileName("");
            }}
          >
            <ArrowIcon className={styles.arrowIcon} />
          </button>
        )}
    </div>
  );
}

Card.propTypes = {
  onInput: PropTypes.func,
  onClick: PropTypes.func,
  hasInput: PropTypes.bool,
  accept: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  title: PropTypes.bool,
  buttonTitle: PropTypes.string,
  possibleStatus: PropTypes.object,
  httpCallStatus: PropTypes.string,
  currentStatus: PropTypes.number,
  setCurrentStatus: PropTypes.func,
};

export default Card;
