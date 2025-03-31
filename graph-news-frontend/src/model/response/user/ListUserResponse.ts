import User from "../../User";
import Page from "../Page";

interface ListUserResponse {
    users: Page<User>;
    message: string
}


export default ListUserResponse;