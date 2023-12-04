import "./App.css";
import { useState, useEffect } from "react";
import PolygonIDVerifier from "./PolygonIDVerifier";
import VcGatedDapp from "./VcGatedDapp";
import axios from "axios"
import { Center, Card, Image, CardBody, Container } from "@chakra-ui/react";
import UserDashboard from "./UserDashboard"

function App() {
  // if you're developing and just want to see the dapp without going through the Polygon ID flow,
  // temporarily set this to "true" to ignore the Polygon ID check and go straight to the dapp page
  const [provedAccessBirthday, setProvedAccessBirthday] = useState(false);


  // useEffect(() => {
  //   if (provedAccessBirthday) {
  //     // Use window.history.pushState to change the URL without triggering a page reload

  //     // Redirect the user to the desired URL
  //     window.location.href = "https://discord.com/api/oauth2/authorize?client_id=1178556490999664681&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8008%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds";
  //     // window.location.href = "https://discord.com/api/oauth2/authorize?client_id=1178556490999664681&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds";
  //   }
  // }, [provedAccessBirthday]);

  useEffect(() => {
    if (provedAccessBirthday) {
      // Make a request to your server-side endpoint for redirection
      fetch("http://localhost:8008/redirect")
        .then((response) => {
          if (response.ok) {
            console.log("Redirecting...");
          } else {
            console.error("Failed to redirect");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [provedAccessBirthday]);


  return (
    <>
      {provedAccessBirthday ? (
        // <VcGatedDapp />
        // <UserDashboard />
        window.location.href = "https://discord.com/api/oauth2/authorize?client_id=1178556490999664681&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8008%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds"
        // window.location.href = "https://discord.com/channels/1176838615268069398/1176838779210829834"
        //https://discord.com/channels/1176838615268069398/1176839418401787944 - get-a-role channel
        //https://discord.com/channels/1176838615268069398/1176838779210829834 - vc-holder channel

        // <h1>Eheee Ho gayaaa</h1> // Move the API call to useEffect to ensure it's called when the component mounts


      ) : (
        <Center className="vc-check-page">
          <Container>
            <Card
              style={{
                border: "2px solid #805AD5",
              }}
            >
              <CardBody style={{ paddingBottom: 0 }}>
                <p>
                  Prove your Identity.
                </p>
                <PolygonIDVerifier
                  publicServerURL={
                    process.env.REACT_APP_VERIFICATION_SERVER_PUBLIC_URL
                  }
                  localServerURL={
                    process.env.REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL
                  }
                  credentialType={"Country"}
                  issuerOrHowToLink={
                    "https://oceans404.notion.site/How-to-get-a-Verifiable-Credential-f3d34e7c98ec4147b6b2fae79066c4f6?pvs=4"
                  }
                  onVerificationResult={setProvedAccessBirthday}
                />
                <Image
                  src="https://bafybeibcgo5anycve5flw6pcz5esiqkvrzlmwdr37wcqu33u63olskqkze.ipfs.nftstorage.link/"
                  alt="Polygon devs image"
                  borderRadius="lg"
                />
              </CardBody>
              <a
                href="https://twitter.com/0ceans404"
                target="_blank"
                rel="noreferrer"
              >
                {/* <p
                  style={{
                    position: "absolute",
                    bottom: "-15px",
                    right: "0",
                    fontSize: "8px",
                  }}
                >
                  Template built with 💜 by Steph
                </p> */}
              </a>
            </Card >
          </Container >
        </Center >
      )
      }
    </>
  );
}

export default App;
