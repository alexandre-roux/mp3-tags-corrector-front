import React, {useEffect, useState} from "react";
import "./FileDetailsDisplayer.scss";
import {ID3Writer} from "browser-id3-writer";
import {saveAs} from "file-saver";
import axios from "axios";

const FileDetailsDisplayer = (props) => {
    const [tags, setTags] = useState();

    useEffect(() => {
        if (!props.selectedFile) return;
        try {
            window.musicmetadata(props.selectedFile, function (error, result) {
                if (error) {
                    console.error("Error reading file metadata:", error);
                    return;
                }
                setTags(result);
                props.setTags(result);
                props.setDisplayResults(true);
            });
        } catch (error) {
            console.error(error);
        }
    }, [props.selectedFile]);

    const writeFile = (coverArrayBuffer) => {
        console.log("Creating file.")
        const reader = new FileReader();
        reader.onload = function () {
            const arrayBuffer = reader.result;
            // arrayBuffer of song or empty arrayBuffer if you just want only id3 tag without song
            const writer = new ID3Writer(arrayBuffer);
            if (props.title) writer.setFrame("TIT2", props.title);
            if (props.artist) writer.setFrame("TPE1", [props.artist]);
            if (props.album) writer.setFrame("TALB", props.album);
            if (props.year) writer.setFrame("TYER", props.year);
            if (props.track) writer.setFrame("TRCK", props.track);
            if (props.genre) writer.setFrame("TCON", [props.genre]);
            if (arrayBuffer)
                writer.setFrame("APIC", {
                    type: 3,
                    data: coverArrayBuffer,
                    description: "Album cover",
                });
            writer.addTag();
            const blob = writer.getBlob();
            console.log("File created.");
            saveAs(blob, props.selectedFile.name);
        };
        reader.onerror = function () {
            console.error("Reader error:", reader.error);
        };
        reader.readAsArrayBuffer(props.selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create an ArrayBuffer of the cover image
        if (props.image) {
            try {
                const response = await axios.get(
                    process.env.API_URL + "/image",
                    {
                        params: {imageurl: props.image},
                        responseType: "arraybuffer",
                    }
                );
                await writeFile(new Uint8Array(response.data));
            } catch (error) {
                console.error("Error while creating ArrayBuffer for image:", error);
            }
        } else {
            writeFile();
        }
    };

    return (
        <>
            {tags && (
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="file-details">
                        <div className="original-details">
                            <div>
                                <p>Filename: {props.selectedFile.name}</p>
                            </div>
                            <div>
                                <p>Title: {tags.title}</p>
                                <p>Artist: {tags.artist}</p>
                                <p>Album: {tags.album}</p>
                                <p>Genre: {tags.genre}</p>
                                <p>Year: {tags.year}</p>
                                <p>
                                    Track: {tags.track.no}/{tags.track.of}
                                </p>
                            </div>
                            <div className="album-cover">
                                {tags.picture.length > 0 ? (
                                    <img
                                        src={`data:${tags.picture[0].format};base64,${btoa(
                                            new Uint8Array(tags.picture[0].data).reduce(
                                                (data, byte) => data + String.fromCharCode(byte),
                                                ""
                                            )
                                        )}`}
                                        alt="Album cover"
                                    />
                                ) : (
                                    <img
                                        src="https://www.chordie.com/images/no-cover.png"
                                        alt="No album cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="button">
                            <input
                                type="image"
                                src="https://www.seekpng.com/png/full/23-238249_arrow-clipart-windows-back-button-logo-png.png"
                                alt="Save new details"
                                name="submit"
                            />
                        </div>
                        <div className="new-details">
                            <div>
                                <p>New values:</p>
                            </div>
                            <div className="form-fields">
                                <input
                                    className="wide"
                                    placeholder="Title"
                                    value={props.title}
                                    onChange={(e) => props.setTitle(e.target.value)}
                                />
                                <input
                                    className="wide"
                                    placeholder="Artist"
                                    value={props.artist}
                                    onChange={(e) => props.setArtist(e.target.value)}
                                />
                                <input
                                    className="wide"
                                    placeholder="Album"
                                    value={props.album}
                                    onChange={(e) => props.setAlbum(e.target.value)}
                                />
                                <input
                                    placeholder="Genre"
                                    value={props.genre}
                                    onChange={(e) => props.setGenre(e.target.value)}
                                />
                                <input
                                    placeholder="Year"
                                    value={props.year}
                                    onChange={(e) => props.setYear(e.target.value)}
                                />
                                <input
                                    placeholder="Track"
                                    value={props.track}
                                    onChange={(e) => props.setTrack(e.target.value)}
                                />
                            </div>
                            <div className="album-cover">
                                <img
                                    src={
                                        props.image === ""
                                            ? "https://www.chordie.com/images/no-cover.png"
                                            : props.image
                                    }
                                    alt="New album cover"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default FileDetailsDisplayer;
