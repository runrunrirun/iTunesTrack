#!/usr/bin/env osascript -l JavaScript
//
// Script to obtain track info from the current track in Music and 1) Output to console and 2) place on Clipboard
//
// fsb 06/2022

function run(argv) {
  // For some reason argv[0] is not the executable name o.O
  // If we get an argument and it's -i, do IRC processing else print help
  if (argv[0]) {
    if (argv[0] == "-i") {
      var doIRCcolor = true;
    } else {
      console.log("Use -i for IRC color codes");
      return;
    }
  }

  if (Application("Music").running()) {
    const app = Application.currentApplication(); //app invoking the script
    app.includeStandardAdditions = true; // need this for clipboard functions

    const iTunes = Application("Music");
    const thistrack = iTunes.currentTrack;
    const streamTitle = iTunes.currentStreamTitle();
    const streamURL = iTunes.currentStreamURL();

    try {
      if (!app) throw "Couldn't get current application!";

      // The following attempts to handle the special case of the Music app being started for the first time.
      // There is no current track or selection, but for some reason JXA assigns a value to the object reference
      // (Applescript version of this fails at assignment). Because of this, the only way to test for the presence of
      // current track data is to actually try to access it; the resulting error seems to bypass the thrown error
      // text and always returns the internal Applescript error. tl;dr JXA bugs that will never be fixed.

      if (!thistrack.name()) throw "No current track.";
    } catch (err) {
      console.log(err);
      return;
    }

    const irc_resetformat = "\x0F";
    const irc_bold = "\x02";
    const irc_italic = "\x1D";
    const irc_underline = "\x1F";
    const irc_color = "\x03";
    const irc_colorRed = "04";
    const irc_colorLightBlue = "12";
    const irc_colorMagenta = "06";
    const irc_colorLightGreen = "09";
    const irc_colorLightCyan = "11";

    var tr_title = thistrack.name();
    var tr_artist = thistrack.artist();
    var tr_album = thistrack.album();
    var tr_type = thistrack.class(); // fileTrack urlTrack audioCDTrack
    var tr_year = thistrack.year();

    if (doIRCcolor) {
      var trackinfo = " is listening to: 🎶  ";
    } else {
      var trackinfo = "Now Playing: 🎶  ";
    }

    // Create trackinfo string
    if (tr_type == "urlTrack" && streamTitle) {
      // If we find a streamTitle, it's an old-style Shoutcast stream
      // assumes that track or artist names don't contain dash

      tr_title = streamTitle.substring(streamTitle.indexOf("-") + 2);
      tr_artist = streamTitle.substring(0, streamTitle.indexOf("-"));
      if (doIRCcolor) {
        trackinfo += `${irc_bold}${irc_color}${irc_colorLightCyan}"${tr_title}"${irc_color}${irc_resetformat} By: ${irc_color}${irc_colorLightGreen}${tr_artist}${irc_color} On: ${streamURL} 🎶`;
      } else {
        trackinfo += `"${tr_title}" By: ${tr_artist} On: ${streamURL} 🎶`;
      }
    } else {
      // Everything else looks the same, but we'll only add info if present in iTunes metadata
      if (doIRCcolor) {
        trackinfo += `${irc_bold}${irc_color}${irc_colorLightCyan}"${tr_title}"${irc_resetformat}`;
        if (tr_artist) {
          trackinfo += ` By: ${irc_color}${irc_colorLightGreen}${tr_artist}${irc_color}`;
        }
        if (tr_album) {
          trackinfo += ` From: ${irc_underline}${irc_color}${irc_colorMagenta}${tr_album}${irc_underline}`;
        }
        if (tr_year) {
          trackinfo += ` [${tr_year}]${irc_resetformat}`;
        }
      } else {
        trackinfo += `"${tr_title}"`;
        if (tr_artist) {
          trackinfo += ` By: ${tr_artist}`;
        }
        if (tr_album) {
          trackinfo += ` From: ${tr_album}`;
        }
        if (tr_year) {
          trackinfo += ` [${tr_year}]`;
        }
      }
      trackinfo += " 🎶 ";
    }
    // Output track info
    console.log(trackinfo);

    // Copy trackinfo to clipboard
    app.setTheClipboardTo(trackinfo);
  } else {
    console.log("Music.app isn't running!");
  }
}
