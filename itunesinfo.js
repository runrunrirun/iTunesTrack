#!/usr/bin/env osascript -l JavaScript
//
// Script to obtain track info from the current track in Music and 1) Output to console and 2) place on Clipboard
//
// fsb 06/2022

// Need this to get exit()
ObjC.import("stdlib");

if (Application("Music").running()) {
  var app = Application.currentApplication();
  app.includeStandardAdditions = true;

  var thistrack = Application("Music").currentTrack;
  var streamTitle = Application("Music").currentStreamTitle();
  var streamURL = Application("Music").currentStreamURL();
  var tr_title = thistrack.name();
  var tr_artist = thistrack.artist();
  var tr_album = thistrack.album();
  var tr_type = thistrack.class(); // fileTrack urlTrack audioCDTrack
  var tr_year = thistrack.year();
  var trackinfo = "🎶 Now Playing: ";

  try {
    if (!app) throw "Couldn't get current application!"
    if (!thistrack) throw "No track data!";
  } catch (err) {
    console.log(err);
    $.exit(-1);
  }

  // Create trackinfo string
  if (tr_type == "urlTrack" && streamTitle) {
    // If we find a streamTitle, it's an old-style Shoutcast stream
    // assumes that track or artist names don't contain dash
    tr_title = streamTitle.substring(streamTitle.indexOf("-") + 2);
    tr_artist = streamTitle.substring(0, streamTitle.indexOf("-"));
    trackinfo += `"${tr_title}"` + " By: " + tr_artist + "Via: " + streamURL;
  } else {
    // Everything else looks the same, but we'll only add info if present in iTunes metadata
    trackinfo += `"${tr_title}"`;
    if (tr_artist) {
      trackinfo += " By: " + tr_artist;
    }
    if (tr_album) {
      trackinfo += " From: " + tr_album;
    }
    if (tr_year) {
      trackinfo += ` [${tr_year}]`;
    }
    trackinfo += "🎶 ";
  }
  // Output track info
  console.log(trackinfo);

  // Copy trackinfo to clipboard
  app.setTheClipboardTo(trackinfo);

} else {
  console.log("Nothing playing!");
}
