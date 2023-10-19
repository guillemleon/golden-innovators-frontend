import axios from "axios";
import yaml from "js-yaml";
import React, { useState } from "react";
import styles from "./App.module.css";
import Card from "./components/Card/Card";

function App() {
  const [xmlData, setXmlData] = useState([]);
  const [yamlData, setYamlData] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(0);
  const possibleStatus = {
    SUCCESS: "success",
    IN_PROGRESS: "in progress",
    NOT_IN_PROGRESS: "not in progress",
    ERROR: "error",
  };
  const [httpCallStatus, setHttpCallStatus] = useState(
    possibleStatus.NOT_IN_PROGRESS
  );

  /**
   * HTTP call to create SPA
   */
  const createSPA = async () => {
    setHttpCallStatus(possibleStatus.IN_PROGRESS);
    await axios({
      method: "post",
      url: "http://localhost:8080/api/v1/createproject",
      data: { spa: xmlData },
    })
      .then((res) => {
        if ([200, 204].includes(res.status)) {
          console.log(res);
        }
        setHttpCallStatus(possibleStatus.SUCCESS);
      })
      .catch((err) => {
        setHttpCallStatus(possibleStatus.ERROR);
      });
  };

  /**
   * Handle upload XML file function on input file.
   *
   * @param e : file input event
   */
  const uploadFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    // const relationsList = [];
    let spaList = [];

    reader.onload = function (event) {
      const xmlString = event.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const objects = xmlDoc.getElementsByTagName("object");

      const spaObjects = Array.from(objects).filter((o) =>
        o.getAttribute("id").toLowerCase().startsWith("spa")
      );

      const apiObjects = Array.from(objects).filter((o) =>
        o.getAttribute("id").toLowerCase().startsWith("api")
      );

      const relObjects = Array.from(objects).filter((o) =>
        o.getAttribute("id").toLowerCase().startsWith("rel")
      );

      spaList = spaObjects.map((spa) => {
        const name = spa.getAttribute("id").toLowerCase();
        return { name };
      });

      spaList.forEach((spa, index) => {
        // find relations with source lower case equal to spaList[x].name and save it into spaList.relations that is an array
        const relations = relObjects.filter((rel) => {
          const maxCell = rel.getElementsByTagName("mxCell");
          const cells = [];
          Array.from(maxCell).forEach((cell) => {
            if (cell.getAttribute("source").toLowerCase() === spa.name) {
              cells.push({
                target: cell.getAttribute("target").toLowerCase(),
                source: cell.getAttribute("source").toLowerCase(),
              });
            }
          });
          return cells.length > 0;
        });

        let cells = [];

        relations.map((rel) => {
          // get source and target attributes for each rel
          const maxCell = rel.getElementsByTagName("mxCell");
          const cell = maxCell[0];

          if (cell.getAttribute("source").toLowerCase() === spa.name) {
            cells.push({
              source: cell.getAttribute("source").toLowerCase(),
              target: cell.getAttribute("target").toLowerCase(),
            });
          }
        });
        // in each element in the spaList add a new property called relations and save the relationsList
        spaList[index].relations = cells;
      });

      spaList.forEach((spa) => {
        const apis = [];
        spa.relations.forEach((rel) => {
          // check if rel starts with "api"
          if (rel.target.toLowerCase().startsWith("api")) {
            const foundApi = apiObjects.find(
              (api) =>
                api.getAttribute("id").toLowerCase() ===
                rel.target.toLowerCase()
            );
            apis.push({
              name: foundApi.getAttribute("id").toLowerCase(),
              endpoint: foundApi.getAttribute("EndPoint"),
              method: foundApi.getAttribute("Verbo"),
            });
          }
        });

        spa.apis = apis;
      });
      setXmlData(spaList);
    };

    reader.readAsText(file);
  };

  /**
   * Handle upload YAML file function on input file.
   *
   * @param e : file input event
   */
  const uploadYaml = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const yamlString = e.target.result;
      const data = yaml.load(yamlString);
      const xmlDataCopy = [...xmlData];
      console.log(data);

      xmlDataCopy.map((spa) => {
        const endpoint = spa.apis[0]?.endpoint;
        const method = spa.apis[0]?.method.toLowerCase();
        const endpointData = data.paths[endpoint];

        if (endpoint) {
          const response =
            endpointData[method].responses["200"].content["application/json"]
              .examples.Response;
          const res200 = response.value[0] || response.value;

          const body =
            endpointData[method].requestBody?.content["application/json"]
              ?.examples?.AnnexIcoUpdate?.value;

          spa.apis[0].mock = JSON.stringify(res200) || "{}";
          spa.apis[0].body = body ? JSON.stringify(body[0]) : "{}";
        }
      });

      setYamlData(data);
      setXmlData(xmlDataCopy);
    };

    reader.readAsText(file);
  };

  const status = [
    {
      id: "funnel1",
      component: (
        <Card
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
          onInput={uploadFile}
          title
          label="Subir XML"
          buttonTitle="Siguiente"
          id="upload-xml"
          accept=".xml"
          onClick={() => {
            setCurrentStatus((prev) => prev + 1);
          }}
          hasInput
          httpCallStatus={httpCallStatus}
          possibleStatus={possibleStatus}
        ></Card>
      ),
    },
    {
      id: "funnel2",
      component: (
        <Card
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
          onInput={uploadYaml}
          title
          label="Subir YAML"
          buttonTitle="Siguiente"
          id="upload-yaml"
          accept=".yaml"
          onClick={() => {
            setCurrentStatus((prev) => prev + 1);
          }}
          hasInput
          httpCallStatus={httpCallStatus}
          possibleStatus={possibleStatus}
        ></Card>
      ),
    },
    {
      id: "funnel3",
      component: (
        <Card
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
          buttonTitle="Generar proyectos"
          onClick={() => {
            createSPA();
          }}
          httpCallStatus={httpCallStatus}
          possibleStatus={possibleStatus}
        ></Card>
      ),
    },
  ];

  return (
    <div className={styles.container}>{status[currentStatus].component}</div>
  );
}

export default App;
