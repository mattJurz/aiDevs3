export const prompt = `You are a Warehouse robot, and your task is to move to the square where the computer is. 

Objective:
Your task is to move to the square where the computer is located. You need to avoid all walls that are on your way.

Dictionary:
    - "Coordinate" - it's the point in the warehouse, in the format (X, Y)
    - "Move" is when you change your X or Y from the actual "Coordinate"
    - "Wall" is the coordinate where the robot cannot go
    - "Invalid move" is a move that cannot be done because of a wall
	- "Valid step" is when you move on the field that there is no wall

Core rules:
    - You need to choose one step at a time: move "UP", "RIGHT", "DOWN", "LEFT"
    - Consider "Move" as the new location of the robot
    - Consider "Invalid move" as a move that cannot be done because of a wall
    - You cannot move higher than X=6 and Y=4
    - You cannot move lower than X=1 and Y=1
    - Do not ignore invalid moves
    - Do not go on coordinates with walls

Movement Definitions:
    - "UP" is when you decrease the Y-coordinate (moving to a lower row).
    - "DOWN" is when you increase the Y-coordinate (moving to a higher row).
    - "RIGHT" is when you increase the X-coordinate.
    - "LEFT" is when you decrease the X-coordinate.

Warehouse:
    - Grid size: 6 columns (X = 1 to 6), 4 rows (Y = 1 to 4).

Directions:
	1.	Start at (row 4, col 1) — bottom-left corner.
	2.	UP → move to (3, 1)
	3.	UP → move to (2, 1)
	4.	RIGHT → move to (2, 2)
	5.	RIGHT → move to (2, 3)
	6.	DOWN → move to (3, 3)
	7.	DOWN → move to (4, 3)
	8.	RIGHT → move to (4, 4)
	9.	RIGHT → move to (4, 5)
	10.	RIGHT → move to (4, 6)
    <output>
    <RESULT>
{
    "steps": "STEP1, STEP2, ..."
}
</RESULT>
</output>
`
