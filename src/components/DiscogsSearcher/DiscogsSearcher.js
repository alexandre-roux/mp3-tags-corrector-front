import React, { useEffect, useState } from "react";
import axios from "axios";
import Result from "../Result/Result";
import "./DiscogsSearcher.scss";
import AlbumDetailsDisplayer from "../AlbumDetailsDisplayer/AlbumDetailsDisplayer";

const DiscogsSearcher = (props) => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [displayAlbumDetails, setDisplayAlbumDetails] = useState(false);
  const [albumToDisplay, setAlbumToDisplay] = useState();

  useEffect(() => {
    setIsLoading(true);

    let keywords = "";

    if (props.tags.title) {
      if (props.tags.artist) {
        keywords += props.tags.artist;
        keywords += " ";
      }
      keywords += props.tags.title;
    } else {
      keywords = props.selectedFile.name;
      keywords = keywords.replace(" - ", " ");
      keywords = keywords.replace(".mp3", "");
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://mp3-tags-corrector.onrender.com/search",
          {
            params: {
              keywords: keywords,
            },
          }
        );
        setData(response.data.results);
        setDisplayAlbumDetails(false);
        setIsLoading(false);
      } catch (error) {
        console.log(error.response);
      }
    };
    fetchData();
  }, [props.tags, props.selectedFile.name]);

  return (
    !isLoading && (
      <div className="discogs-results">
        <div className={props.displayResults ? "results" : "results hidden"}>
          {data.map((result, index) => {
            return (
              <Result
                key={index}
                result={result}
                setDisplayResults={props.setDisplayResults}
                setDisplayAlbumDetails={setDisplayAlbumDetails}
                setAlbumToDisplay={setAlbumToDisplay}
              />
            );
          })}
        </div>
        {albumToDisplay && (
          <div className={displayAlbumDetails ? "" : "hidden"}>
            <AlbumDetailsDisplayer
              albumToDisplay={albumToDisplay}
              setDisplayResults={props.setDisplayResults}
              setDisplayAlbumDetails={setDisplayAlbumDetails}
              setTitle={props.setTitle}
              setArtist={props.setArtist}
              setAlbum={props.setAlbum}
              setGenre={props.setGenre}
              setYear={props.setYear}
              setTrack={props.setTrack}
              setImage={props.setImage}
            />
          </div>
        )}
      </div>
    )
  );
};
export default DiscogsSearcher;
