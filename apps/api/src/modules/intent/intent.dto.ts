import { IsNotEmpty, IsString } from "class-validator";

export class CreateIntentDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
