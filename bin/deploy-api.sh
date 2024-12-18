ssh-add -D
eval `ssh-agent -s`

ssh-add ~/.ssh/id_db
cd ..
cd db
git pull
cd ..
ssh-add -D


git submodule update --init --recursive


ssh-add ~/.ssh/id_api_sandbox
git fetch
wait

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then

        read -p "Already up to date, run yarn and build it anyway?(y/n)" answer
    case ${answer:0:1} in y|Y|"" )

            echo "Running yarn"
                yarn
    wait
    echo "Building..."
    yarn build
    wait
    pm2 restart api
    wait
    pm2 logs api
    ;;
    * )
        echo "No"
    ;;
esac
elif [ $LOCAL = $BASE ]; then
        echo "Pulling..."
    git pull
    wait
    read -p "Run yarn and yarn build (y/n)?" answer
case ${answer:0:1} in
    y|Y|"" )
            echo "Running yarn..."
    yarn
    wait
    echo "Building..."
    yarn build
    wait
    pm2 restart api
    wait
    pm2 logs api

    ;;
    * )
        echo "No"
    ;;
esac
   elif [ $REMOTE = $BASE ]; then
    echo "Need to push"
else
    echo "Diverged"
fi