import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, ListGroup, Card } from "react-bootstrap";
import "./App.css";

function App() {
  const defaultServerUrl = "http://192.168.4.83:5279"; // update port if needed
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [tracks, setTracks] = useState([]);
  const [serverFound, setServerFound] = useState(true);
  const [customServerUrl, setCustomServerUrl] = useState("");
  const [audioSrc, setAudioSrc] = useState("");

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/library/tracks`);
      if (!response.ok) {
        throw new Error("Server responded with an error");
      }
      const data = await response.json();
      setTracks(data);
      setServerFound(true);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setServerFound(false);
      setTracks([]);
    }
  };

  const handleServerUrlSubmit = (e) => {
    e.preventDefault();
    if (customServerUrl) {
      setServerUrl(customServerUrl);
    }
  };

  const handleTrackDoubleClick = (trackId) => {
    setAudioSrc(`${serverUrl}/api/music/stream/${trackId}`);
  };

  const handleScanClick = async () => {
    try {
      await fetch(`${serverUrl}/api/library/scan`, { method: "POST" });
      fetchTracks();
    } catch (error) {
      console.error("Error initiating scan:", error);
    }
  };

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="mb-4">Music Library Client</h1>
        </Col>
      </Row>
      {!serverFound && (
        <Row className="mb-4">
          <Col>
            <Card className="p-3">
              <Card.Text>
                No server found at <strong>{serverUrl}</strong>. Please enter the server URL:
              </Card.Text>
              <Form onSubmit={handleServerUrlSubmit}>
                <Form.Group controlId="serverUrl">
                  <Form.Control
                    type="text"
                    value={customServerUrl}
                    onChange={(e) => setCustomServerUrl(e.target.value)}
                    placeholder="e.g. http://192.168.1.100:5280"
                  />
                </Form.Group>
                <Button className="mt-2" variant="primary" type="submit">
                  Set Server URL
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
      {serverFound && (
        <>
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Button variant="success" onClick={handleScanClick}>
                Initiate Scan
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>Tracks</h2>
              {tracks.length === 0 ? (
                <p>No tracks found. Try initiating a scan.</p>
              ) : (
                <ListGroup>
                  {tracks.map((track) => (
                    <ListGroup.Item
                      key={track.id}
                      action
                      onDoubleClick={() => handleTrackDoubleClick(track.id)}
                    >
                      {track.trackTitle} by {track.artist}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>
          </Row>
          {audioSrc && (
            <Row className="mt-4">
              <Col>
                <Card className="p-3">
                  <Card.Title>Now Playing</Card.Title>
                  <audio controls autoPlay src={audioSrc} className="w-100">
                    Your browser does not support the audio element.
                  </audio>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
}

export default App;
