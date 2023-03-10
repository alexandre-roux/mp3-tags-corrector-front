import React, { useEffect, useState } from "react";
import "./AlbumDetailsDisplayer.scss";
import axios from "axios";

const AlbumDetailsDisplayer = (props) => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [artist, setArtist] = useState();

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      try {
        let response;
        if (props.albumToDisplay.id === props.albumToDisplay.master_id) {
          response = await axios.get(
            "https://mp3-tags-corrector.onrender.com/master",
            {
              params: {
                id: props.albumToDisplay.id,
              },
            }
          );
        } else {
          response = await axios.get(
            "https://mp3-tags-corrector.onrender.com/release",
            {
              params: {
                id: props.albumToDisplay.id,
              },
            }
          );
        }

        setData(response.data.release);
        setArtist(
          response.data.release.artists.map((artist, index) => {
            let result = artist.name;
            if (index < response.data.release.artists.length - 1) {
              result += ", ";
            }
            return result;
          })
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error.response);
      }
    };
    fetchData();
  }, [props.albumToDisplay]);

  const handleBackToResults = () => {
    props.setDisplayAlbumDetails(false);
    props.setDisplayResults(true);
  };

  const handleTrackSelected = (track, trackNumber) => {
    props.setTitle(track.title);
    props.setArtist(artist);
    props.setAlbum(data.title);
    props.setGenre(data.styles[0]);
    props.setYear(data.year);
    props.setTrack(trackNumber);
    props.setImage(data.images[0].uri);
  };

  const handleGenreSelected = (genre) => {
    props.setGenre(genre);
  };

  const handleCoverSelected = (cover) => {
    props.setImage(cover);
  };

  return (
    <div className="album-details">
      <div className="back-to-results" onClick={handleBackToResults}>
        <ion-icon name="arrow-back-outline" />
        Back to results
      </div>
      {!isLoading && (
        <>
          <div>
            <p>
              Release page:{" "}
              <a href={data.uri} target="_blank" rel="noreferrer">
                {data.uri}
              </a>
            </p>
          </div>
          <div>
            <p>Artist: {artist}</p>
            <p>Album: {data.title}</p>
            <p>
              Genre:{" "}
              {data.styles.map((genre, index) => {
                let result = genre;
                if (index < data.styles.length - 1) {
                  result += ", ";
                }
                return (
                  <span key={index} onClick={() => handleGenreSelected(genre)}>
                    {result}
                  </span>
                );
              })}
            </p>
            <p>Year: {data.year}</p>
          </div>
          <div>
            <p>Tracklist (select a track):</p>
            <ul>
              {data.tracklist.map((track, index) => {
                const trackNumber = index + 1 + "/" + data.tracklist.length;
                let trackDetails = trackNumber;
                if (isNaN(track.position)) trackDetails += " " + track.position;
                trackDetails += " " + track.title;
                return (
                  <li
                    key={index}
                    onClick={() => handleTrackSelected(track, trackNumber)}
                  >
                    {trackDetails}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="album-covers">
            {data.images.map((image, index) => {
              return (
                <img
                  key={index}
                  src={image.uri}
                  alt="Album cover"
                  onClick={() => handleCoverSelected(image.uri)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AlbumDetailsDisplayer;
