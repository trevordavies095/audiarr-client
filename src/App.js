import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Table,
  Button,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  // Base server URL (adjust as needed)
  const defaultServerUrl = "http://192.168.4.83:5279";
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [customServerUrl, setCustomServerUrl] = useState("");
  const [serverFound, setServerFound] = useState(true);

  // New state for artists and albums
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // For playback tracking
  const [audioSrc, setAudioSrc] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState(null);

  // Fetch artists on component mount or when serverUrl changes
  useEffect(() => {
    fetchArtists();
  }, [serverUrl]);

  const fetchArtists = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/library/artists`);
      if (!response.ok) {
        throw new Error("Server error");
      }
      const data = await response.json();
      setArtists(data);
      setServerFound(true);
      // Select the first artist by default if none is selected
      if (data.length > 0 && !selectedArtist) {
        setSelectedArtist(data[0]);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
      setServerFound(false);
      setArtists([]);
    }
  };

  // When selectedArtist changes, fetch the albums for that artist
  useEffect(() => {
    if (selectedArtist) {
      fetchAlbums(selectedArtist);
    }
  }, [selectedArtist, serverUrl]);

  const fetchAlbums = async (artist) => {
    try {
      const response = await fetch(
        `${serverUrl}/api/library/albums?artist=${encodeURIComponent(artist)}`
      );
      if (!response.ok) {
        throw new Error("Server error");
      }
      const data = await response.json();
      setAlbums(data);
      // Automatically select the first album if available
      if (data.length > 0) {
        setSelectedAlbum(data[0].albumName);
      } else {
        setSelectedAlbum(null);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
      setAlbums([]);
      setSelectedAlbum(null);
    }
  };

  // Helper: Get the tracks for the selected album from the albums state
  const getTracksForSelectedAlbum = () => {
    if (!selectedAlbum) return [];
    const albumObj = albums.find((a) => a.albumName === selectedAlbum);
    return albumObj ? albumObj.tracks : [];
  };

  // Handlers for UI interactions
  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    // Reset selected album when the artist changes
    setSelectedAlbum(null);
  };

  const handleAlbumClick = (albumName) => {
    setSelectedAlbum(albumName);
  };

  const handleTrackDoubleClick = (trackId) => {
    // When a row is double-clicked, set the audio source to stream the track,
    // and mark this track as playing.
    setAudioSrc(`${serverUrl}/api/music/stream/${trackId}`);
    setPlayingTrackId(trackId);
  };

  const handleServerUrlSubmit = (e) => {
    e.preventDefault();
    if (customServerUrl) {
      setServerUrl(customServerUrl);
      // Reset selections when the server URL changes
      setSelectedArtist(null);
      setSelectedAlbum(null);
    }
  };

  // For display: current track list is those from the selected album
  const currentTracks = getTracksForSelectedAlbum();

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="text-center">audiarr</h1>
        </Col>
      </Row>

      {/* Server URL configuration, if server is not found */}
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
          {/* Row with Artists and Albums side by side */}
          <Row className="mb-3">
            {/* Left Box: Artists */}
            <Col md={6}>
              <Card style={{ height: "300px", overflowY: "auto" }}>
                <Card.Header>Artists</Card.Header>
                <ListGroup variant="flush">
                  {artists.map((artist, index) => (
                    <ListGroup.Item
                      key={index}
                      active={artist === selectedArtist}
                      onClick={() => handleArtistClick(artist)}
                      style={{ cursor: "pointer" }}
                    >
                      {artist}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>

            {/* Right Box: Albums for the selected artist */}
            <Col md={6}>
              <Card style={{ height: "300px", overflowY: "auto" }}>
                <Card.Header>Albums</Card.Header>
                <ListGroup variant="flush">
                  {albums.map((album, index) => (
                    <ListGroup.Item
                      key={index}
                      active={album.albumName === selectedAlbum}
                      onClick={() => handleAlbumClick(album.albumName)}
                      style={{ cursor: "pointer" }}
                    >
                      {album.albumName} ({album.releaseYear})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>

          {/* Row with Tracks Table (below Artists and Albums) */}
          <Row className="mb-3">
            <Col>
              <Card>
                <Card.Header>Tracks</Card.Header>
                <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {currentTracks.length === 0 ? (
                    <p>No tracks available for this album.</p>
                  ) : (
                    <Table striped bordered hover responsive>
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
                        {currentTracks.map((track) => (
                          <tr
                            key={track.id}
                            onDoubleClick={() => handleTrackDoubleClick(track.id)}
                            style={{ cursor: "pointer" }}
                            className={
                              track.id === playingTrackId ? "table-primary" : ""
                            }
                            title="Double-click to play"
                          >
                            <td>{track.trackTitle}</td>
                            <td>
                              {track.duration
                                ? track.duration.split(".")[0] // Simplified display (hh:mm:ss)
                                : "N/A"}
                            </td>
                            <td>{track.artist}</td>
                            <td>{track.albumName}</td>
                            <td>{track.genre}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Now Playing Bar */}
          {audioSrc && (
            <div className="now-playing-bar">
              <Row>
                <Col>
                  <Card className="p-3">
                    <Card.Title>Now Playing</Card.Title>
                    {currentTracks.find((t) => t.id === playingTrackId) && (
                      <Card.Text>
                        {currentTracks.find((t) => t.id === playingTrackId).trackTitle} -{" "}
                        {currentTracks.find((t) => t.id === playingTrackId).artist}
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
