import { waffleJest } from '@ethereum-waffle/jest';
import { Contract } from "ethers";

jest.setTimeout(10000);
expect.extend(waffleJest);
