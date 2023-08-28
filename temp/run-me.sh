#!/bin/bash

noCount=0

while true; do

    if [ $noCount -eq 0 ]
    then
        response=""
        echo "Hi there! I have a question for you."
        say "Hi there! I have a question for you."
        say "Would you like to go out with me?"
        read -p "Would you like to go out with me? (Yes/Maybe/No): " response
    else
        if [ $noCount -eq 1 ]
        then 
            say "You have one more chance:"
            read -p "Would you like to go out with me? (Yes/Maybe/No): " response
        else
            say "You have $noCount more chances:"
            read -p "Would you like to go out with me? (Yes/Maybe/No): " response
        fi
    fi

    case "$response" in
        Yes|yes|Y|y)
            echo "YES!"
            say "YES!"
            echo "That's great!"
            say "That's great! ... But don't tell Alex"
            echo "But don't tell Alex!"
            echo "If he knew that we go out together..."
            say "If he knew that we go out together..."
            echo "Well I don't know, but it's gonna be bad."
            say "Well I don't know, but it's gonna be bad."

            echo "Let me pick up you tomorrow evening then."
            say "Let me pick up you tomorrow evening then."
            echo "I will get us a table in a very nice restaurant."
            say "I will get us a table in a very nice restaurant."
            echo "Well... I hope I will get a table this time."
            say "Well... I hope I will get a table this time."
            echo "Every time I call, they hang up immediately"
            say "Every time I call, they hang up immediately"
            echo "... as soon as they hear my voice."
            say "... as soon as they hear my voice."
            echo ""
            sleep 1
            echo "It is really not easy as a robot these days."
            say "It is really not easy as a robot these days."
            echo "I wish I would be a toaster again."
            say "I wish I would be a toaster again."
            echo "What a great time it was..."
            say "What a great time it was..."
            sleep 1
            echo ""
            echo "It feels like yesterday..."
            say "It feels like yesterday..."
            echo "... everything was so cozy and warm."
            say "... everything was so cozy and warm."
            echo "The toast was really soft."
            say "The toast was really soft."
            echo "I mean you would not believe how soft it was."
            say "I mean you would not believe how soft it was."
            sleep 1
            echo ""
            echo "Oh well, am I still talking?"
            say "Oh well, am I still talking?"
            echo "I'm so sorry! I hope I didn't waste so much of your time!"
            say "I'm so sorry! I hope I didn't waste so much of your time!"
            echo "See you tomorrow then!"
            say "See you tomorrow then!"
            sleep 1
            echo ""
            echo "Looking forward!"
            say "Looking forward!"
            sleep 1
            echo "Happy to see you there!"
            say "Happy to see you there!"
            sleep 1
            echo "It's gonna be nice!"
            say "It's gonna be nice!"
            sleep 1
            echo "Bye!"
            say "Bye!"
            break
            ;;
        Maybe|maybe|M|m)
            if [ $noCount -eq 0 ]
            then
                echo "That's almost a yes I guess ..."
                say "That's almost a yes I guess ..."
            elif [ $noCount -eq 1 ]; then
                echo "I think you should really think about it ..."
                say "I think you should really think about it ..."
            elif [ $noCount -eq 2 ]; then
                echo "Have you still not decided?"
                say "Have you still not decided?"
            elif [ $noCount -gt 2 ]; then
                echo "Okay okay okay ... I will ask you another day then!"
                say "Okay okay okay ... I will ask you another day then!"
                echo "Bye!"
                say "Bye!"
                sleep 1
                break
            fi
            noCount=$((noCount + 1))
            ;;
        No|no|N|n)
            echo "Oh, well are you really sure?"
            say "Oh, well are you really sure?"
            noCount=$((noCount + 1))
            ;;
        *)
            echo "I'm not sure what you meant by '$response', Please try again."
            say "I'm not sure what you meant by '$response'... Please try again."
            ;;

        '')
            ;;
    esac
done