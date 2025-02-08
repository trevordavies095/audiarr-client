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
  const defaultServerUrl = "http://192.168.4.83:5279";
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [customServerUrl, setCustomServerUrl] = useState("");
  const [serverFound, setServerFound] = useState(true);
  const [serverName, setServerName] = useState("Audiarr");

  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);

  const [audioSrc, setAudioSrc] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState(null);

  // Fetch artists & server name on load

    // Fetch artists on component mount or when serverUrl changes
    useEffect(() => {
      fetchArtists();
    }, [serverUrl]);
  

  // Fetch the server name on component mount
  useEffect(() => {
    fetchServerName();
  }, [serverUrl]);

  const fetchServerName = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/settings/server-name`);
      if (!response.ok) throw new Error("Failed to fetch server name");

      const data = await response.json();
      if (data?.serverName) {
        setServerName(data.serverName);
        document.title = `${data.serverName} - Music Library`;
      } else {
        throw new Error("ServerName missing in response");
      }
    } catch (error) {
      console.error("Error fetching server name:", error);
      setServerName("Audiarr");
      document.title = "Audiarr - Music Library";
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/library/artists`);
      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setArtists(data);
      setServerFound(true);
    } catch (error) {
      console.error("Error fetching artists:", error);
      setServerFound(false);
      setArtists([]);
    }
  };

  const handleArtistClick = (artist) => {
    if (selectedArtist?.id === artist.id) return; // Prevent redundant re-fetch

    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setAlbums([]); // Reset albums
    setTracks([]); // Reset tracks

    fetchAlbums(artist.id);
  };

  const fetchAlbums = async (artistId) => {
    try {
      const response = await fetch(`${serverUrl}/api/library/albums?artistId=${artistId}`);
      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setAlbums(data); // ✅ Only loads albums for selected artist
      setSelectedAlbum(null); // Reset album selection
    } catch (error) {
      console.error("Error fetching albums:", error);
      setAlbums([]);
      setSelectedAlbum(null);
    }
  };

  const handleAlbumClick = (album) => {
    if (selectedAlbum?.albumId === album.albumId) return; // Prevent redundant re-fetch

    setSelectedAlbum(album);
    setTracks([]); // Reset tracks

    fetchTracks(album.albumId);
  };

  const fetchTracks = async (albumId) => {
    try {
      const response = await fetch(`${serverUrl}/api/library/tracks?albumId=${albumId}`);
      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setTracks(data.tracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setTracks([]);
    }
  };

  const handleTrackDoubleClick = (trackId) => {
    const streamUrl = `${serverUrl}/api/music/stream/${trackId}`;
    setAudioSrc(streamUrl);
    setPlayingTrackId(trackId);
};


  const handleServerUrlSubmit = (e) => {
    e.preventDefault();
    if (customServerUrl) {
      setServerUrl(customServerUrl);
      setSelectedArtist(null);
      setSelectedAlbum(null);
      setTracks([]);
    }
  };

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="text-center">{serverName}</h1>
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
            <Col md={6}>
              <Card style={{ height: "300px", overflowY: "auto" }}>
                <Card.Header>Artists</Card.Header>
                <ListGroup variant="flush">
                  {artists.map((artist) => (
                    <ListGroup.Item
                      key={artist.id}
                      active={selectedArtist?.id === artist.id} 
                      onClick={() => handleArtistClick(artist)}
                      style={{ cursor: "pointer" }}
                    >
                      {artist.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>

            <Col md={6}>
              <Card style={{ height: "300px", overflowY: "auto" }}>
                <Card.Header>Albums</Card.Header>
                <ListGroup variant="flush">
                  {albums.map((album) => (
                    <ListGroup.Item
                      key={album.albumId}
                      active={selectedAlbum?.albumId === album.albumId}
                      onClick={() => handleAlbumClick(album)}
                      style={{ cursor: "pointer" }}
                    >
                      {album.albumName} ({album.releaseYear})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Card>
                <Card.Header>Tracks</Card.Header>
                <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {tracks.length === 0 ? (
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
                        {tracks.map((track) => (
                          <tr
                            key={track.id}
                            onDoubleClick={() => handleTrackDoubleClick(track.id)}
                            style={{ cursor: "pointer" }}
                            className={track.id === playingTrackId ? "table-primary" : ""}
                            title="Double-click to play"
                          >
                            <td>{track.trackTitle}</td>
                            <td>{track.duration ? track.duration.split(".")[0] : "N/A"}</td>
                            <td>{track.artist}</td>
                            <td>{selectedAlbum?.albumName || "Unknown"}</td>
                            <td>{selectedAlbum?.genre || "Unknown"}</td>
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
                    {tracks.find((t) => t.id === playingTrackId) && (
                        <Card.Text>
                        {tracks.find((t) => t.id === playingTrackId).trackTitle} -{" "}
                        {tracks.find((t) => t.id === playingTrackId).artist}
                        </Card.Text>
                    )}
                    <audio key={playingTrackId} controls autoPlay src={audioSrc} className="w-100">
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
