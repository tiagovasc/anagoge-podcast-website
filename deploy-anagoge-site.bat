@echo off
setlocal enabledelayedexpansion

:: ================================================================
:: deploy-anagoge-site.bat
::
:: Publishes this folder to its OWN GitHub repo, which Railway
:: auto-deploys from.
::
::   Project folder : Projects\Anagoge Podcast Website
::   Target repo    : github.com/tiagovasc/anagoge-podcast-website
::   Live site      : anagoge-podcast-website-production.up.railway.app
::
:: This folder is a STANDALONE repo, deliberately separate from the
:: workspace repo - same pattern as Virtual Assistant\. It has its own
:: .git and its own .gitignore (the standard Next.js one).
::
:: WHY THE SEPARATION MATTERS: the workspace .gitignore blanket-ignores
:: *.png/*.jpg/*.svg as "workspace media". Applied to a website, that
:: silently strips every image and deploys a broken site. It did exactly
:: that on 2026-08-11. This folder must never be governed by it.
::
:: Safe to run repeatedly. First run initialises the repo and force-
:: pushes over the old subtree history; later runs are plain pushes.
::
:: Set RUN_BUILD=1 below to production-build locally before pushing.
:: ================================================================

set "RUN_BUILD=0"

set "WORKSPACE=C:\Users\tiago\OneDrive\Desktop\Claude"
set "PROJDIR=%WORKSPACE%\Projects\Anagoge Podcast Website"
set "PREFIX=Projects/Anagoge Podcast Website"
set "REPO_URL=https://github.com/tiagovasc/anagoge-podcast-website.git"
set "BRANCH=main"
set "LOGFILE=%PROJDIR%\deploy-log.txt"
set "TIMESTAMP=%date% %time%"
set "FIRST_PUSH="

echo.
echo ================================================================
echo  Deploy Anagoge Podcast Website  -  %TIMESTAMP%
echo ================================================================
echo.

echo. >> "%LOGFILE%"
echo ================================================================ >> "%LOGFILE%"
echo [%TIMESTAMP%] Deploy started >> "%LOGFILE%"
echo ================================================================ >> "%LOGFILE%"

:: ---------------------------------------------------------------
:: [0/7] Preflight
:: ---------------------------------------------------------------
echo [0/7] Preflight checks...

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] git is not on PATH. Install Git for Windows.
    echo [%TIMESTAMP%] ERROR: git not found >> "%LOGFILE%"
    goto :done
)

if not exist "%PROJDIR%\package.json" (
    echo [ERROR] Project folder not found: %PROJDIR%
    echo [%TIMESTAMP%] ERROR: project folder missing >> "%LOGFILE%"
    goto :done
)

echo   OK.

:: ---------------------------------------------------------------
:: [1/7] One-time workspace cleanup
:: Detach this folder from the workspace repo. Runs once, then
:: self-detects as already done on every later run.
:: ---------------------------------------------------------------
echo.
echo [1/7] Checking workspace repo separation...

pushd "%WORKSPACE%"

set "STILL_TRACKED=0"
for /f %%c in ('git ls-files -- "%PREFIX%" ^| find /c /v ""') do set "STILL_TRACKED=%%c"

if not "!STILL_TRACKED!"=="0" (
    echo   Workspace repo still tracks !STILL_TRACKED! file^(s^) here. Untracking...
    echo [%TIMESTAMP%] untracking !STILL_TRACKED! files from workspace repo >> "%LOGFILE%"
    rem Stage the untrack only. We deliberately do NOT commit here:
    rem   - "git commit -- pathspec" does a PARTIAL commit from the working
    rem     tree, which would silently re-add the very files we just removed.
    rem   - A bare "git commit" would sweep in anything else you had staged.
    rem The folder is now in the workspace .gitignore, so git-push.bat's
    rem "git add -A" cannot re-add it, and its commit records the removal.
    git rm -r --cached --quiet -- "%PREFIX%" >> "%LOGFILE%" 2>&1
    set "NEEDS_WORKSPACE_COMMIT=1"
    echo   Untrack STAGED in the workspace repo.
    echo   ^>^> Run git-push.bat afterwards to commit it.
) else (
    echo   Already separate. Nothing to untrack.
)

rem Drop the stale subtree remote from the old approach, if present
git remote get-url anagoge >nul 2>&1
if not errorlevel 1 (
    echo   Removing stale "anagoge" subtree remote...
    git remote remove anagoge >> "%LOGFILE%" 2>&1
)

popd

:: ---------------------------------------------------------------
:: [2/7] Optional local production build
:: ---------------------------------------------------------------
echo.
if "%RUN_BUILD%"=="1" (
    echo [2/7] Running local production build...
    pushd "%PROJDIR%"
    call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
    if errorlevel 1 (
        echo   [ERROR] npm install failed. See %LOGFILE%
        echo [%TIMESTAMP%] ERROR: npm install failed >> "%LOGFILE%"
        popd
        goto :done
    )
    call npm run build >> "%LOGFILE%" 2>&1
    if errorlevel 1 (
        echo   [ERROR] Build FAILED - not pushing a broken build.
        echo [%TIMESTAMP%] ERROR: next build failed >> "%LOGFILE%"
        popd
        goto :done
    )
    popd
    echo   Build OK.
) else (
    echo [2/7] Local build skipped ^(set RUN_BUILD=1 at top to enable^).
)

:: ---------------------------------------------------------------
:: [3/7] Initialise the standalone repo if needed
:: ---------------------------------------------------------------
echo.
echo [3/7] Checking this folder's own repo...

cd /d "%PROJDIR%"

if not exist ".git\objects" (
    echo   No repo here yet. Initialising...
    echo [%TIMESTAMP%] git init in project folder >> "%LOGFILE%"
    if exist ".git" rmdir /s /q ".git"
    git init >> "%LOGFILE%" 2>&1
    git remote add origin "%REPO_URL%" >> "%LOGFILE%" 2>&1
    git branch -M %BRANCH% >> "%LOGFILE%" 2>&1
    git config http.postBuffer 524288000
    git config http.version HTTP/1.1
    set "FIRST_PUSH=1"
    echo   Initialised. First push will overwrite the old subtree history.
) else (
    echo   Repo already initialised.
)

if exist ".git\index.lock" (
    echo   [WARNING] Removing stale .git\index.lock ...
    del /f ".git\index.lock"
)

:: ---------------------------------------------------------------
:: [4/7] Stage everything
:: ---------------------------------------------------------------
echo.
echo [4/7] Staging changes...
git add -A >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo   [ERROR] git add failed. See %LOGFILE%
    echo [%TIMESTAMP%] ERROR: git add failed >> "%LOGFILE%"
    goto :done
)

rem ---- Asset guard -------------------------------------------------
rem On 2026-08-11 a blanket image ignore shipped a live site with every
rem image 404ing while every other check passed. Never deploy blind.
set "IGNORED_ASSETS=0"
for /f %%c in ('git ls-files --others --ignored --exclude-standard -- "public" ^| find /c /v ""') do set "IGNORED_ASSETS=%%c"
set "TRACKED_ASSETS=0"
for /f %%c in ('git ls-files -- "public" ^| find /c /v ""') do set "TRACKED_ASSETS=%%c"

echo   Assets under public/: !TRACKED_ASSETS! tracked, !IGNORED_ASSETS! ignored.
echo [%TIMESTAMP%] assets tracked=!TRACKED_ASSETS! ignored=!IGNORED_ASSETS! >> "%LOGFILE%"

if not "!IGNORED_ASSETS!"=="0" (
    echo.
    echo   [WARNING] !IGNORED_ASSETS! file^(s^) under public/ are IGNORED by git
    echo             and will NOT reach Railway. The site would deploy with
    echo             broken images. Check this folder's .gitignore.
    echo   The ignored files are listed in the log.
    git ls-files --others --ignored --exclude-standard -- "public" >> "%LOGFILE%" 2>&1
    echo.
    rem NOTE: no parentheses in this prompt string. A ")" inside a quoted
    rem set /p prompt can prematurely close the enclosing block in CMD.
    set /p "CONTINUE_ANYWAY=  Continue anyway? [y/N]: "
    if /i not "!CONTINUE_ANYWAY!"=="y" (
        echo   Aborted. Nothing was pushed.
        echo [%TIMESTAMP%] ABORTED by user: ignored assets >> "%LOGFILE%"
        goto :done
    )
)
rem ------------------------------------------------------------------

echo.
echo   Changes staged:
git diff --cached --stat
git diff --cached --stat >> "%LOGFILE%" 2>&1

:: ---------------------------------------------------------------
:: [5/7] Commit
:: ---------------------------------------------------------------
echo.
echo [5/7] Committing...

git diff --cached --quiet
if errorlevel 1 (
    set "MSG=Anagoge site update - %date%"
    echo   Committing: !MSG!
    git commit -m "!MSG!" >> "%LOGFILE%" 2>&1
    if errorlevel 1 (
        echo   [WARNING] Commit returned non-zero. See %LOGFILE%
        echo [%TIMESTAMP%] WARNING: commit non-zero >> "%LOGFILE%"
    ) else (
        echo   Commit successful.
        echo [%TIMESTAMP%] Commit successful >> "%LOGFILE%"
    )
) else (
    echo   No changes to commit - pushing current state.
    echo [%TIMESTAMP%] Nothing to commit >> "%LOGFILE%"
)

:: ---------------------------------------------------------------
:: [6/7] Push (retry up to 3 times)
:: ---------------------------------------------------------------
echo.
if defined FIRST_PUSH (
    echo [6/7] Force-pushing to origin/%BRANCH% ^(replacing old subtree history^)...
) else (
    echo [6/7] Pushing to origin/%BRANCH% ...
)

set "PUSH_OK="
for /l %%i in (1,1,3) do (
    if not defined PUSH_OK (
        echo   Push attempt %%i of 3 ...
        echo [%TIMESTAMP%] push attempt %%i >> "%LOGFILE%"
        if defined FIRST_PUSH (
            git push -u origin %BRANCH% --force >> "%LOGFILE%" 2>&1
        ) else (
            git push -u origin %BRANCH% >> "%LOGFILE%" 2>&1
        )
        if not errorlevel 1 (
            set "PUSH_OK=1"
            echo   Push successful.
            echo [%TIMESTAMP%] push successful on attempt %%i >> "%LOGFILE%"
        ) else (
            echo   Attempt %%i failed, retrying...
            echo [%TIMESTAMP%] push attempt %%i failed >> "%LOGFILE%"
            timeout /t 3 /nobreak >nul
        )
    )
)

if not defined PUSH_OK (
    echo.
    echo   [ERROR] Push failed after 3 attempts.
    echo   Check the log: %LOGFILE%
    echo.
    echo   Common causes:
    echo     - Auth prompt cancelled or credentials expired
    echo     - No network
    echo [%TIMESTAMP%] ERROR: push failed after 3 attempts >> "%LOGFILE%"
    goto :done
)

:: ---------------------------------------------------------------
:: [7/7] Done
:: ---------------------------------------------------------------
echo.
echo [7/7] Published. !TRACKED_ASSETS! asset^(s^) under public/ are in the repo.
echo.
echo   Repo    : https://github.com/tiagovasc/anagoge-podcast-website
echo   Live    : https://anagoge-podcast-website-production.up.railway.app
echo   Railway : https://railway.com/dashboard
echo.
echo   Railway auto-deploys from %BRANCH%. Give it about a minute,
echo   then hard-refresh the live site ^(Ctrl+F5^).
echo.
echo   NOTE: this folder is NOT part of the workspace repo. Running
echo   git-push.bat will not publish the site, and this bat will not
echo   commit the rest of your workspace. They are fully separate.

if defined NEEDS_WORKSPACE_COMMIT (
    echo.
    echo   ACTION NEEDED: the workspace repo has a STAGED untrack of this
    echo   folder waiting to be committed. Run:
    echo       Code and Scripts\git\git-push.bat
)

:done
echo.
echo ================================================================
set "ENDTIME=%date% %time%"
echo  Finished at %ENDTIME%
echo  Full log: %LOGFILE%
echo ================================================================
echo [%ENDTIME%] Deploy finished >> "%LOGFILE%"
echo.

pause
endlocal
