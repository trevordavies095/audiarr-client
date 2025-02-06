import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Table, Card } from "react-bootstrap";
import "./App.css";

function App() {
  const defaultServerUrl = "http://192.168.4.83:5279"; // update port if needed
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [tracks, setTracks] = useState([]);
  const [serverFound, setServerFound] = useState(true);
  const [customServerUrl, setCustomServerUrl] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [hoveredTrackId, setHoveredTrackId] = useState(null);

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  const sortTracks = (tracks) => {
    // Make a shallow copy using slice() so we don't mutate the original array.
    return tracks.slice().sort((a, b) => {
      // Compare by artist name (alphabetically, case-insensitive)
      const artistCompare = a.artist.localeCompare(b.artist, undefined, { sensitivity: "base" });
      if (artistCompare !== 0) return artistCompare;
  
      // Compare by album release year (oldest first); convert to numbers in case they're strings.
      const aYear = Number(a.releaseYear) || 0;
      const bYear = Number(b.releaseYear) || 0;
      if (aYear !== bYear) return aYear - bYear;
  
      // Compare by album name as a fallback.
      const albumCompare = a.albumName.localeCompare(b.albumName, undefined, { sensitivity: "base" });
      if (albumCompare !== 0) return albumCompare;
  
      // Compare by track number (ascending)
      const aTrackNum = Number(a.trackNumber) || 0;
      const bTrackNum = Number(b.trackNumber) || 0;
      return aTrackNum - bTrackNum;
    });
  };

  const deduplicateTracks = (data) => {
    // Assuming track.id is unique:
    const trackMap = new Map();
    data.forEach(track => {
      trackMap.set(track.id, track);
    });
    return Array.from(trackMap.values());
  };
  

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/library/tracks`);
      if (!response.ok) {
        throw new Error("Server responded with an error");
      }
      const data = await response.json();

      console.log("Original length:", data.length);

      // Deduplicate the array based on track.id.
    const deduplicated = deduplicateTracks(data);

    // Now sort the deduplicated array.
    const sortedData = sortTracks(deduplicated);

    console.log("Original length:", data.length);
    console.log("After deduplication:", deduplicated.length);
    console.log("After sorting:", sortedData.length);
    setTracks(sortedData);
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
    // When a row is double-clicked, set the audio source to stream the track,
    // and mark this track as playing.
    setAudioSrc(`${serverUrl}/api/music/stream/${trackId}`);
    setPlayingTrackId(trackId);
  };

  const handleScanClick = async () => {
    try {
      await fetch(`${serverUrl}/api/library/scan`, { method: "POST" });
      fetchTracks();
    } catch (error) {
      console.error("Error initiating scan:", error);
    }
  };

  const currentTrack = tracks.find((t) => t.id === playingTrackId);



  // Helper function to format the duration from "hh:mm:ss.xxx" to "mm:ss"
  const formatDuration = (durationStr) => {
    if (!durationStr) return "N/A";
    const parts = durationStr.split(":");
    if (parts.length < 3) return durationStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    const totalMinutes = hours * 60 + minutes;
    const wholeSeconds = Math.floor(seconds);
    const formattedMinutes = totalMinutes.toString().padStart(2, "0");
    const formattedSeconds = wholeSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <Container className="my-4 main-content">
      <Row>
        <Col>
          <h1 className="mb-4 text-center">Music Library Client</h1>
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
              <h2 className="mb-3">Tracks</h2>
              {tracks.length === 0 ? (
                <p>No tracks found. Try initiating a scan.</p>
              ) : (
                <div className="d-flex justify-content-center">
                  <Table striped bordered hover style={{ maxWidth: "90%" }}>
                    <thead>
                      <tr>
                        <th>Song</th>
                        <th>Time</th>
                        <th>Artist</th>
                        <th>Album</th>
                        <th>Genre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((track) => (
                        <tr
                          key={track.id}
                          onMouseEnter={() => setHoveredTrackId(track.id)}
                          onMouseLeave={() => setHoveredTrackId(null)}
                          onDoubleClick={() => handleTrackDoubleClick(track.id)}
                          style={{ cursor: "pointer" }}
                          className={
                            track.id === playingTrackId
                              ? "table-primary"
                              : hoveredTrackId === track.id
                              ? "table-info"
                              : ""
                          }
                          title="Double-click to play"
                        >
                          <td>{track.trackTitle}</td>
                          <td>{formatDuration(track.duration)}</td>
                          <td>{track.artist}</td>
                          <td>{track.albumName}</td>
                          <td>{track.genre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Col>
          </Row>
          {audioSrc && (
            <div className="now-playing-bar">
              <Row>
                <Col>
                  <Card className="p-3">
                    <Card.Title>Now Playing</Card.Title>
                    {currentTrack && (
                      <Card.Text>
                        {currentTrack.trackTitle} - {currentTrack.artist}
                      </Card.Text>
                    )}
                    <audio controls autoPlay src={audioSrc} className="w-100">
                      Your browser does not support the audio element.
                    </audio>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default App;
